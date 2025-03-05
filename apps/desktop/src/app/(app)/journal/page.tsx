"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Check,
  ChevronDown,
  Eye,
  Edit2,
  List,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { useToast } from "@repo/ui/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/ui/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import MarkdownEditor from "../../../components/journal/MarkdownEditor";
import { MarkdownPreview } from "../../../components/journal/MarkdownPreview";
import { JournalEntryCard } from "../../../components/journal/JournalEntryCard";
import {
  journalService,
  type JournalEntryFormData,
} from "../../../lib/journalService";
import type { JournalEntry } from "../../../database/db";
import debounce from "lodash.debounce";
import { useJournalStore } from "../../../store/journalStore";

export default function JournalPage() {
  const { toast } = useToast();
  // Get UI state from the store
  const {
    viewMode,
    showTags,
    showToolbar,
    showLineNumbers,
    setViewMode,
    toggleShowTags,
    toggleShowToolbar,
    toggleShowLineNumbers,
  } = useJournalStore();

  // Local state for entries and form data
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState<JournalEntryFormData>({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Initialize with an empty entry if none exists
  useEffect(() => {
    if (entries.length === 0) {
      handleNewEntry();
    } else if (!selectedEntry) {
      // Select the most recent entry
      setSelectedEntry(entries[0]);
      setFormData({
        id: entries[0].id,
        title: entries[0].title,
        content: entries[0].content,
        tags: entries[0].tags || [],
      });
    }
  }, [entries, selectedEntry]);

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(query)),
    );
  }, [entries, searchQuery]);

  // Debounced save function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (data: JournalEntryFormData, entryId?: number) => {
      if (!data.title.trim()) return; // Don't save without a title

      try {
        setIsSaving(true);

        if (entryId) {
          // Update existing entry
          await journalService.update(entryId, data);
          setEntries((prevEntries) =>
            prevEntries.map((entry) =>
              entry.id === entryId
                ? {
                    ...entry,
                    ...data,
                    updatedAt: new Date().getTime(),
                  }
                : entry,
            ),
          );
        } else {
          // Create new entry
          const newId = await journalService.create(data);
          const newEntry = {
            ...data,
            id: newId,
            dateString: new Date().toISOString().split("T")[0],
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
          };

          setEntries((prevEntries) => [newEntry, ...prevEntries]);
          setSelectedEntry(newEntry);
          setFormData((prev) => ({ ...prev, id: newId }));
        }

        const now = new Date();
        setLastSaved(now);
      } catch (error) {
        console.error("Error auto-saving journal entry:", error);
        toast({
          title: "Error",
          description: "Failed to save journal entry",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000), // Auto-save after 1 second of inactivity
    [],
  );

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (formData.title.trim()) {
      debouncedSave(formData, selectedEntry?.id);
    }
  }, [formData, selectedEntry?.id, debouncedSave]);

  async function loadEntries() {
    try {
      const allEntries = await journalService.getAll();
      setEntries(allEntries);
    } catch (error) {
      console.error("Error loading journal entries:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      });
    }
  }

  function handleNewEntry() {
    debouncedSave.flush(); // Save any pending changes

    setSelectedEntry(null);
    setFormData({
      title: "",
      content: "",
      tags: [],
    });
    setLastSaved(null);

    // Set viewMode to edit to ensure we're in edit mode for the new entry
    if (viewMode !== "edit") {
      setViewMode("edit");
    }
  }

  function handleSelectEntry(entry: JournalEntry) {
    if (selectedEntry?.id === entry.id) return; // Already selected

    debouncedSave.flush(); // Save any pending changes

    setSelectedEntry(entry);
    setFormData({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      tags: entry.tags || [],
    });
    setLastSaved(new Date(entry.updatedAt || entry.createdAt || Date.now()));
  }

  function promptDeleteEntry(id: number) {
    setEntryToDelete(id);
  }

  async function confirmDeleteEntry() {
    if (!entryToDelete) return;

    try {
      const id = entryToDelete;
      await journalService.delete(id);
      setEntries(entries.filter((entry) => entry.id !== id));

      if (selectedEntry?.id === id) {
        if (entries.length > 1) {
          // Select the next entry if available
          const nextEntry = entries.find((entry) => entry.id !== id);
          if (nextEntry) {
            handleSelectEntry(nextEntry);
          } else {
            handleNewEntry();
          }
        } else {
          handleNewEntry();
        }
      }

      toast({
        title: "Success",
        description: "Journal entry deleted",
      });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    } finally {
      setEntryToDelete(null);
    }
  }

  function handleFormDataChange(
    updatedFormData: Partial<JournalEntryFormData>,
  ) {
    setFormData((prev) => ({ ...prev, ...updatedFormData }));
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags?.includes(newTag)) {
        const updatedTags = [...(formData.tags || []), newTag];
        handleFormDataChange({ tags: updatedTags });
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    const updatedTags = formData.tags?.filter((tag) => tag !== tagToRemove);
    handleFormDataChange({ tags: updatedTags });
  }

  // Format the last saved time
  const getSavedStatus = () => {
    if (isSaving) return "Saving...";
    if (!lastSaved) return "Not saved yet";

    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();

    if (diff < 60000) return "Saved just now";
    if (diff < 3600000)
      return `Saved ${Math.floor(diff / 60000)} minute(s) ago`;

    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Journal</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {getSavedStatus()}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {viewMode === "edit" ? "Edit Mode" : "Preview Mode"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode("edit")}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Mode
                {viewMode === "edit" && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("preview")}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Mode
                {viewMode === "preview" && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleShowTags}>
                Show Tags
                {showTags && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleShowToolbar}>
                Show Toolbar
                {showToolbar && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleShowLineNumbers}>
                <List className="mr-2 h-4 w-4" />
                Show Line Numbers
                {showLineNumbers && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleNewEntry}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search entries..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 overflow-auto max-h-[calc(100vh-250px)]">
            {filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <div key={entry.id} onClick={() => handleSelectEntry(entry)}>
                  <JournalEntryCard
                    entry={entry}
                    onEdit={handleSelectEntry}
                    onDelete={promptDeleteEntry}
                    isActive={selectedEntry?.id === entry.id}
                  />
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery
                  ? "No matching entries found"
                  : "No journal entries yet"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Input
              value={formData.title}
              onChange={(e) => handleFormDataChange({ title: e.target.value })}
              placeholder="Entry title"
              className="text-2xl font-semibold border-none px-0 text-foreground focus-visible:ring-0"
            />
          </div>

          {showTags && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag..."
                className="inline-flex w-auto min-w-[100px] h-6 text-xs px-2"
              />
            </div>
          )}

          {viewMode === "edit" ? (
            <MarkdownEditor
              content={formData.content}
              onChange={(content) => handleFormDataChange({ content })}
              placeholder="Write your thoughts here..."
              autoFocus
              showToolbar={showToolbar}
              showLineNumbers={showLineNumbers}
            />
          ) : (
            <MarkdownPreview content={formData.content} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={entryToDelete !== null}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Confirm Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
