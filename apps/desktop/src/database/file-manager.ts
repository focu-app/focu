import {
  exists,
  mkdir,
  readDir,
  readFile,
  writeFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { v4 as uuidv4 } from "uuid";
import { documentDir, join } from "@tauri-apps/api/path";
import { format } from "date-fns";

export class FileManager {
  private baseDirectory: string = "";
  private isInitialized: boolean = false;

  /**
   * Initialize the file manager with a specific base directory
   */
  async initialize(subDirectory: string = "chats"): Promise<string> {
    if (this.isInitialized) return this.baseDirectory;

    // Use the documents directory as the base
    const docDir = await documentDir();
    this.baseDirectory = await join(docDir, "Focu", subDirectory);

    // Create base directory if it doesn't exist
    await this.ensureDirectoryExists(this.baseDirectory);

    this.isInitialized = true;
    console.log(`File manager initialized at: ${this.baseDirectory}`);
    return this.baseDirectory;
  }

  /**
   * Create directory if it doesn't exist
   */
  async ensureDirectoryExists(path: string): Promise<void> {
    if (!(await exists(path))) {
      await mkdir(path, { recursive: true });
    }
  }

  /**
   * Build a path relative to base directory
   */
  async buildPath(...segments: string[]): Promise<string> {
    return join(this.baseDirectory, ...segments);
  }

  /**
   * Generate a unique ID
   */
  generateId(): string {
    return uuidv4();
  }

  /**
   * Write content to a file
   */
  async writeFile(path: string, content: string): Promise<void> {
    // Ensure parent directory exists
    const lastSlashIndex = path.lastIndexOf("/");
    if (lastSlashIndex > 0) {
      const dirPath = path.substring(0, lastSlashIndex);
      await this.ensureDirectoryExists(dirPath);
    }

    // Write file
    await writeFile(path, new TextEncoder().encode(content));
  }

  /**
   * Read file content
   */
  async readFile(path: string): Promise<string> {
    if (!(await exists(path))) {
      throw new Error(`File not found: ${path}`);
    }
    const data = await readFile(path);
    return new TextDecoder().decode(data);
  }

  /**
   * Delete a file
   */
  async deleteFile(path: string): Promise<void> {
    if (await exists(path)) {
      await remove(path);
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(directory: string = "", pattern?: RegExp): Promise<string[]> {
    const dirPath = directory
      ? await this.buildPath(directory)
      : this.baseDirectory;

    if (!(await exists(dirPath))) {
      return [];
    }

    const entries = await readDir(dirPath);
    let files = entries
      .filter((entry) => entry.name && entry.isFile)
      .map((entry) => entry.name as string);

    if (pattern) {
      files = files.filter((name) => pattern.test(name));
    }

    return files;
  }

  /**
   * Get the base directory
   */
  getBaseDirectory(): string {
    return this.baseDirectory;
  }
}
