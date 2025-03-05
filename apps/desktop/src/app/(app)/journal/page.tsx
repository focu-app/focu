"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, FileText, PencilLine } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { useToast } from "@repo/ui/hooks/use-toast";
import MarkdownEditor from "../../../components/journal/MarkdownEditor";
import { MarkdownPreview } from "../../../components/journal/MarkdownPreview";
import { JournalEntryCard } from "../../../components/journal/JournalEntryCard";
import {
  journalService,
  type JournalEntryFormData,
} from "../../../lib/journalService";
import type { JournalEntry } from "../../../database/db";

export default function JournalPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState<JournalEntryFormData>({
    title: "",
    content: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

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
    setActiveEntry(null);
    setFormData({
      title: "",
      content: "",
      tags: [],
    });
    setIsEditorOpen(true);
  }

  function handleViewEntry(entry: JournalEntry) {
    setSelectedEntry(entry);
    setViewMode("preview");
  }

  function handleEditEntry(entry: JournalEntry) {
    setActiveEntry(entry);
    setFormData({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      tags: entry.tags || [],
    });
    setIsEditorOpen(true);
  }

  async function handleDeleteEntry(id: number) {
    try {
      await journalService.delete(id);
      setEntries(entries.filter((entry) => entry.id !== id));
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

  async function handleSaveEntry() {
    try {
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        });
        return;
      }

      if (activeEntry?.id) {
        // Update existing entry
        await journalService.update(activeEntry.id, formData);
        setEntries(
          entries.map((entry) =>
            entry.id === activeEntry.id
              ? { ...entry, ...formData, updatedAt: new Date().getTime() }
              : entry,
          ),
        );
        toast({
          title: "Success",
          description: "Journal entry updated",
        });
      } else {
        // Create new entry
        const newId = await journalService.create(formData);
        const newEntry = {
          ...formData,
          id: newId,
          dateString: new Date().toISOString().split("T")[0],
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime(),
        };
        setEntries([newEntry, ...entries]);
        toast({
          title: "Success",
          description: "Journal entry created",
        });
      }

      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    }
  }

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags?.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), newTag],
        });
      }
      setTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove: string) {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove),
    });
  }

  // Render the main grid content
  const renderMainContent = () => {
    if (selectedEntry && viewMode === "preview") {
      return (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{selectedEntry.title}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditEntry(selectedEntry)}
              >
                <PencilLine className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEntry(null)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Browse All
              </Button>
            </div>
          </div>

          {selectedEntry.tags && selectedEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedEntry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4">
            <MarkdownPreview content={selectedEntry.content} />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card border rounded-lg p-6">
        <Tabs defaultValue="write">
          <TabsList className="mb-4">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Journal</h2>
            <p className="text-muted-foreground">
              Write freely about your day, thoughts, or anything that comes to
              mind. Use markdown to format your text. Your entries are saved
              locally.
            </p>

            <div className="mt-8">
              <Button onClick={handleNewEntry} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create a New Entry
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h2>About Journaling</h2>
              <p>
                Journaling is a powerful practice that can help enhance your
                focus and mental clarity. Regular journaling can:
              </p>
              <ul>
                <li>Reduce stress and anxiety</li>
                <li>Improve self-awareness</li>
                <li>Help process difficult emotions</li>
                <li>Track personal growth over time</li>
                <li>Create a record of your experiences and ideas</li>
              </ul>
              <h3>Markdown Support</h3>
              <p>
                This editor supports Markdown formatting, which means you can
                use syntax like:
              </p>
              <ul>
                <li>
                  <code># Heading 1</code> for main headings
                </li>
                <li>
                  <code>## Heading 2</code> for subheadings
                </li>
                <li>
                  <code>*italic*</code> for <em>italic text</em>
                </li>
                <li>
                  <code>**bold**</code> for <strong>bold text</strong>
                </li>
                <li>
                  <code>- item</code> for bullet lists
                </li>
                <li>
                  <code>1. item</code> for numbered lists
                </li>
                <li>
                  <code>```code```</code> for code blocks
                </li>
                <li>
                  <code>`code`</code> for <code>inline code</code>
                </li>
                <li>
                  <code>{">"} quote</code> for blockquotes
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Journal</h1>
        <Button onClick={handleNewEntry}>
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
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
                <div key={entry.id} onClick={() => handleViewEntry(entry)}>
                  <JournalEntryCard
                    entry={entry}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
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

        {renderMainContent()}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeEntry ? "Edit Entry" : "New Journal Entry"}
            </DialogTitle>
            <DialogDescription>
              {activeEntry
                ? "Update your journal entry below."
                : "Write your thoughts, insights, or reflections below."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Give your entry a title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <MarkdownEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your thoughts here..."
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (press Enter to add)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-primary hover:text-primary/80"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
