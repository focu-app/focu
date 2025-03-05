import { format } from "date-fns";
import { db, type JournalEntry } from "../database/db";

export interface JournalEntryFormData {
  id?: number;
  title: string;
  content: string;
  tags?: string[];
}

export const journalService = {
  /**
   * Get all journal entries
   */
  async getAll(): Promise<JournalEntry[]> {
    return db.journalEntries.orderBy("createdAt").reverse().toArray();
  },

  /**
   * Get journal entries for a specific date
   */
  async getByDate(dateString: string): Promise<JournalEntry[]> {
    return db.journalEntries.where("dateString").equals(dateString).toArray();
  },

  /**
   * Get a single journal entry by ID
   */
  async getById(id: number): Promise<JournalEntry | undefined> {
    return db.journalEntries.get(id);
  },

  /**
   * Create a new journal entry
   */
  async create(data: JournalEntryFormData): Promise<number> {
    const dateString = format(new Date(), "yyyy-MM-dd");
    const entry: JournalEntry = {
      title: data.title,
      content: data.content,
      dateString,
      tags: data.tags || [],
    };

    return db.journalEntries.add(entry);
  },

  /**
   * Update an existing journal entry
   */
  async update(id: number, data: JournalEntryFormData): Promise<void> {
    await db.journalEntries.update(id, {
      title: data.title,
      content: data.content,
      tags: data.tags,
      updatedAt: new Date().getTime(),
    });
  },

  /**
   * Delete a journal entry
   */
  async delete(id: number): Promise<void> {
    await db.journalEntries.delete(id);
  },
};
