"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";
import { PlusCircle, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { journalService } from "@/lib/journalService";
import type { JournalEntry } from "@/database/db";
import { useToast } from "@repo/ui/hooks/use-toast";
import { cn } from "@repo/ui/lib/utils";
import { useSearchParams } from "next/navigation";

export function JournalSidebar() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<Record<string, JournalEntry[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const searchParams = useSearchParams();
  const entryId = searchParams.get("id");

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Keep track of selected entry from the main page
  useEffect(() => {
    const updateSelectedEntry = (e: CustomEvent) => {
      if (e.detail?.entry) {
        setSelectedEntry(e.detail.entry);
      }
    };

    window.addEventListener(
      "journal:entry-selected",
      updateSelectedEntry as EventListener,
    );

    return () => {
      window.removeEventListener(
        "journal:entry-selected",
        updateSelectedEntry as EventListener,
      );
    };
  }, []);

  async function loadEntries() {
    try {
      const allEntries = await journalService.getAll();

      // Group entries by date
      const groupedEntries = allEntries.reduce(
        (acc, entry) => {
          const dateString = entry.dateString;
          if (!acc[dateString]) {
            acc[dateString] = [];
          }
          acc[dateString].push(entry);
          return acc;
        },
        {} as Record<string, JournalEntry[]>,
      );

      // Sort entries within each date group by newest first
      for (const date of Object.keys(groupedEntries)) {
        groupedEntries[date].sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        );
      }

      setEntries(groupedEntries);
    } catch (error) {
      console.error("Error loading journal entries:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive",
      });
    }
  }

  // Filter entries based on search query
  const filteredEntries = searchQuery.trim()
    ? Object.entries(entries).reduce(
        (acc, [date, dateEntries]) => {
          const filtered = dateEntries.filter((entry) => {
            const query = searchQuery.toLowerCase();
            return (
              entry.title.toLowerCase().includes(query) ||
              entry.content.toLowerCase().includes(query) ||
              entry.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
          });

          if (filtered.length > 0) {
            acc[date] = filtered;
          }

          return acc;
        },
        {} as Record<string, JournalEntry[]>,
      )
    : entries;

  async function handleNewEntry() {
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

      // Add to entries list in the correct date group
      setEntries((prevEntries) => {
        const dateString = newEntry.dateString;
        const updatedEntries = { ...prevEntries };

        if (!updatedEntries[dateString]) {
          updatedEntries[dateString] = [];
        }

        updatedEntries[dateString] = [newEntry, ...updatedEntries[dateString]];
        return updatedEntries;
      });

      // Select the new entry locally
      setSelectedEntry(newEntry);

      // Notify the main component
      window.dispatchEvent(
        new CustomEvent("journal:select-entry", {
          detail: { entry: newEntry },
        }),
      );
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
    setSelectedEntry(entry);
    window.dispatchEvent(
      new CustomEvent("journal:select-entry", {
        detail: { entry },
      }),
    );
  }

  function promptDeleteEntry(id: number) {
    window.dispatchEvent(
      new CustomEvent("journal:delete-entry", {
        detail: { id },
      }),
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderEntryButton = (entry: JournalEntry) => (
    <ContextMenu key={entry.id} modal={false}>
      <ContextMenuTrigger>
        <Button
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-between",
            Number(entryId) === entry.id || selectedEntry?.id === entry.id
              ? "bg-primary/10 hover:bg-primary/10"
              : "",
          )}
          onClick={() => handleSelectEntry(entry)}
          id={`context-menu-trigger-${entry.id}`}
          data-allow-context-menu="true"
        >
          {entry.title.length > 25
            ? `${entry.title.slice(0, 25)}...`
            : entry.title}
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onSelect={() => handleSelectEntry(entry)}>
          Edit Entry
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            if (entry.id) promptDeleteEntry(entry.id);
          }}
        >
          Delete Entry
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <div className="flex flex-col h-full z-50">
      <div className="p-2 flex flex-row gap-2 justify-start items-center h-12 border-b z-10 w-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleNewEntry}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Entry</TooltipContent>
        </Tooltip>
        <div data-tauri-drag-region className="flex-1 h-full" />
      </div>

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

      <ScrollArea className="flex-grow">
        <div className="flex flex-col p-4 gap-2">
          {Object.entries(filteredEntries).length > 0 ? (
            Object.entries(filteredEntries).map(([date, dateEntries]) => (
              <div key={date} id={`date-group-${date}`} className="mb-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {formatDate(date)}
                </div>
                <div className="flex flex-col gap-1">
                  {dateEntries.map(renderEntryButton)}
                </div>
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
      </ScrollArea>
    </div>
  );
}
