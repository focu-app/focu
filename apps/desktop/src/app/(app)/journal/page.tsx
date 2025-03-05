"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Check,
  ChevronDown,
  Eye,
  Edit2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
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
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";

export default function JournalPage() {
  const { toast } = useToast();
  // Get UI state from the store
  const {
    viewMode,
    showTags,
    showToolbar,
    setViewMode,
    toggleShowTags,
    toggleShowToolbar,
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Only select the first entry if available, but don't create new entries automatically
  useEffect(() => {
    if (entries.length > 0 && !selectedEntry) {
      // Select the most recent entry if we have entries but nothing selected
      setSelectedEntry(entries[0]);
      setFormData({
        id: entries[0].id,
        title: entries[0].title,
        content: entries[0].content,
        tags: entries[0].tags || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (formData.title.trim() && selectedEntry?.id) {
      debouncedSave(formData, selectedEntry.id);
    }
  }, [formData, selectedEntry, debouncedSave]);

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

  async function handleNewEntry() {
    // Flush any pending saves for the current entry
    debouncedSave.flush();

    // Set viewMode to edit to ensure we're in edit mode for the new entry
    if (viewMode !== "edit") {
      setViewMode("edit");
    }

    try {
      // Create a new entry immediately with a placeholder title
      const placeholderData = {
        title: "Untitled",
        content: "",
        tags: [],
      };

      // Save to database immediately
      const newId = await journalService.create(placeholderData);

      // Create the entry object
      const newEntry = {
        ...placeholderData,
        id: newId,
        dateString: new Date().toISOString().split("T")[0],
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      };

      // Add to entries list (at the top)
      setEntries((prevEntries) => [newEntry, ...prevEntries]);

      // Select the new entry and populate form
      setSelectedEntry(newEntry);
      setFormData({
        id: newId,
        title: "Untitled",
        content: "",
        tags: [],
      });

      setLastSaved(new Date());

      // Focus the title input and select all text
      setTimeout(() => {
        const titleInput = document.querySelector(
          'input[placeholder="Entry title"]',
        ) as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
          titleInput.select(); // Select all text in the field
        }
      }, 100);
    } catch (error) {
      console.error("Error creating new journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to create new journal entry",
        variant: "destructive",
      });
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
    <div className="flex flex-col h-full">
      <div
        className="flex items-center p-2 border-b h-12 z-50"
        data-tauri-drag-region
      >
        <div className="flex-1 flex items-center gap-2" data-tauri-drag-region>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isSidebarVisible ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
          <h1 className="text-xl font-semibold">Journal</h1>
        </div>
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
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleNewEntry}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex bg-background/80 dark:bg-background/50">
        {isSidebarVisible && (
          <div className="w-[300px] border-r flex-shrink-0 h-full flex flex-col">
            <div className="p-4 flex-shrink-0">
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
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-130px)]">
                <div className="space-y-2 px-4 pb-4">
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleSelectEntry(entry)}
                      >
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
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto h-full">
              <div className="h-full p-4">
                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <h2 className="text-2xl font-semibold">
                      Welcome to Your Journal
                    </h2>
                    <p className="text-center text-muted-foreground max-w-md">
                      Start writing your thoughts, reflections, and ideas. Your
                      journal entries are stored locally.
                    </p>
                    <Button className="mt-4" onClick={handleNewEntry}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Entry
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 gap-4 max-w-4xl mx-auto">
                    <div>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          handleFormDataChange({ title: e.target.value })
                        }
                        placeholder="Entry title"
                        className="text-2xl font-semibold border-none text-foreground focus-visible:ring-0"
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

                    <div className="flex-1 border rounded-lg overflow-hidden">
                      {viewMode === "edit" ? (
                        <MarkdownEditor
                          content={formData.content}
                          onChange={(content) =>
                            handleFormDataChange({ content })
                          }
                          placeholder="Write your thoughts here..."
                          autoFocus
                          showToolbar={showToolbar}
                        />
                      ) : (
                        <MarkdownPreview content={formData.content} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
