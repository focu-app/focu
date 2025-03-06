"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
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
import {
  journalService,
  type JournalEntryFormData,
} from "../../../lib/journalService";
import { useJournalStore } from "../../../store/journalStore";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/database/db";
import { MarkdownPreview } from "../../../components/journal/MarkdownPreview";
import debounce from "lodash.debounce";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

export default function JournalPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id");

  // Get UI state from the store
  const {
    viewMode,
    showTags,
    showToolbar,
    isSidebarVisible,
    toggleSidebar,
    setViewMode,
    toggleShowTags,
    toggleShowToolbar,
  } = useJournalStore();

  // Local state for form data
  const [formData, setFormData] = useState<JournalEntryFormData>({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  // Use liveQuery to fetch entries
  const entries = useLiveQuery(async () => {
    return db.journalEntries.orderBy("createdAt").reverse().toArray();
  }, []);

  // Use liveQuery to fetch the selected entry
  const selectedEntry = useLiveQuery(async () => {
    if (!entryId) return null;
    return db.journalEntries.get(Number(entryId));
  }, [entryId]);

  // Navigate to the most recent entry when the page loads without an ID
  useEffect(() => {
    const navigateToMostRecentEntry = async () => {
      // Only redirect if we're on the base journal page with no ID
      if (!entryId && entries && entries.length > 0) {
        // Navigate to the most recent entry (entries are already sorted newest first)
        router.push(`/journal?id=${entries[0].id}`);
      }
    };

    navigateToMostRecentEntry();
  }, [entryId, entries, router]);

  // Listen for delete event from the sidebar
  useEffect(() => {
    const onDeleteEntryEvent = (e: CustomEvent) => {
      if (e.detail?.id) {
        promptDeleteEntry(e.detail.id);
      }
    };

    window.addEventListener(
      "journal:delete-entry",
      onDeleteEntryEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "journal:delete-entry",
        onDeleteEntryEvent as EventListener,
      );
    };
  }, []);

  // Update form data when selected entry changes
  useEffect(() => {
    if (selectedEntry) {
      setFormData({
        id: selectedEntry.id,
        title: selectedEntry.title,
        content: selectedEntry.content,
        tags: selectedEntry.tags || [],
      });
      setLastSaved(
        new Date(
          selectedEntry.updatedAt || selectedEntry.createdAt || Date.now(),
        ),
      );
    } else {
      // Clear form data if no entry is selected
      setFormData({
        title: "",
        content: "",
        tags: [],
      });
      setLastSaved(null);
    }
  }, [selectedEntry]);

  const debouncedSave = useCallback(
    debounce(
      async (data: JournalEntryFormData, id: number) => {
        try {
          setIsSaving(true);
          await journalService.update(id, data);
          setLastSaved(new Date());
        } catch (error) {
          console.error("Error saving journal entry:", error);
          toast({
            title: "Error",
            description: "Failed to save journal entry",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      },
      1000,
      { maxWait: 5000 },
    ),
    [],
  );

  // Trigger auto-save when form data changes
  useEffect(() => {
    if (formData.title.trim() && selectedEntry?.id) {
      debouncedSave(formData, selectedEntry.id);
    }
  }, [formData, selectedEntry, debouncedSave]);

  async function handleNewEntry() {
    // Flush any pending saves for the current entry
    debouncedSave.flush();

    try {
      // Create a new entry using the journal store function
      const newId = await useJournalStore.getState().createNewEntry();

      // Navigate to the new entry if creation was successful
      if (newId) {
        router.push(`/journal?id=${newId}`);
      }
    } catch (error) {
      console.error("Error creating new journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to create new journal entry",
        variant: "destructive",
      });
    }
  }

  function promptDeleteEntry(id: number) {
    setEntryToDelete(id);
  }

  async function confirmDeleteEntry() {
    if (!entryToDelete) return;

    try {
      const id = entryToDelete;
      await journalService.delete(id);

      // If we're deleting the currently selected entry
      if (selectedEntry?.id === id) {
        // Fetch the latest entries again to find the most recent one after deletion
        const latestEntries = await db.journalEntries
          .orderBy("createdAt")
          .reverse()
          .toArray();

        if (latestEntries.length > 0) {
          // Navigate to the most recent entry
          router.push(`/journal?id=${latestEntries[0].id}`);
        } else {
          // If no entries left, just go to the base journal page
          router.push("/journal");
        }
      }

      setEntryToDelete(null);
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

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center border-b h-12 z-50"
        data-tauri-drag-region
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-3"
        >
          {isSidebarVisible ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        <div
          className="flex-1 flex justify-center items-center"
          data-tauri-drag-region
        >
          <h1 className="text-xl font-semibold">Journal</h1>
        </div>

        <div className="flex items-center gap-2 mr-3" data-tauri-drag-region>
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
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-auto bg-background">
        <div className="max-w-7xl mx-auto h-full w-full">
          <div className="h-full p-4">
            {entries && entries.length === 0 ? (
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
            ) : !selectedEntry ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <h2 className="text-2xl font-semibold">
                  Select a Journal Entry
                </h2>
                <p className="text-center text-muted-foreground max-w-md">
                  Choose an entry from the sidebar or create a new one.
                </p>
                <Button className="mt-4" onClick={handleNewEntry}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
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
                  <ScrollArea className="flex-1 h-[calc(100vh-350px)]">
                    {viewMode === "edit" ? (
                      <div
                        className="h-full"
                        onClick={(e) => {
                          // Focus the editor when clicking on the container
                          // Only if clicking directly on this div (not on editor content)
                          if (e.target === e.currentTarget) {
                            const editorContent =
                              document.querySelector(".ProseMirror");
                            if (editorContent) {
                              (editorContent as HTMLElement).focus();
                            }
                          }
                        }}
                      >
                        <MarkdownEditor
                          content={formData.content}
                          onChange={(content) =>
                            handleFormDataChange({ content })
                          }
                          placeholder="Write your thoughts here..."
                          autoFocus
                          showToolbar={showToolbar}
                        />
                      </div>
                    ) : (
                      <MarkdownPreview content={formData.content} />
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
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
