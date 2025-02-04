import {
  BaseDirectory,
  exists,
  mkdir,
  readDir,
  readFile,
  writeFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { save, open } from "@tauri-apps/plugin-dialog";
import * as workerTimers from "worker-timers";
import { format } from "date-fns";
import { db } from "./db";

const BACKUP_DIR = "Focu/backups";
const MAX_BACKUPS = 10;

export async function setupBackupManager() {
  // Ensure backup directory exists
  try {
    const dirExists = await exists(BACKUP_DIR, {
      baseDir: BaseDirectory.Document,
    });
    if (!dirExists) {
      // Create directory recursively
      await mkdir(BACKUP_DIR, {
        baseDir: BaseDirectory.Document,
        recursive: true,
      });
    }
  } catch (error) {
    console.error("Failed to create backup directory:", error);
  }
}

/**
 * Creates a backup of the database at the specified path
 * @param customPath Optional custom path to save the backup. If not provided, saves to the default backup directory
 * @returns true if backup was successful, false otherwise
 */
export async function createBackup(customPath?: string): Promise<boolean> {
  try {
    const { exportDB: exportDexieDB } = await import("dexie-export-import");
    const date = format(new Date(), "yyyy-MM-dd HH.mm.ss");
    const backupName = `backup-${date}.json`;
    const backupPath = customPath || `${BACKUP_DIR}/${backupName}`;

    // Export the database
    const blob = await exportDexieDB(db);
    const arrayBuffer = await blob.arrayBuffer();

    // Write the backup file
    await writeFile(backupPath, new Uint8Array(arrayBuffer), {
      baseDir: customPath ? undefined : BaseDirectory.Document,
    });

    // Only rotate backups for automatic backups
    if (!customPath) {
      await rotateBackups();
    }

    console.log("Backup created successfully:", backupPath);
    return true;
  } catch (error) {
    console.error("Failed to create backup:", error);
    return false;
  }
}

/**
 * Exports the database to a user-selected location
 * @returns true if export was successful, false otherwise
 */
export async function exportDatabase(): Promise<boolean> {
  const date = format(new Date(), "yyyy-MM-dd HH.mm.ss");
  const name = `Focu Backup ${date}.json`;

  const path = await save({
    filters: [{ name: "JSON", extensions: ["json"] }],
    defaultPath: name,
  });

  if (path) {
    return createBackup(path);
  }

  return false;
}

/**
 * Imports a database from a file
 * @param path Optional path to the file to import. If not provided, opens a file picker
 */
export async function importDatabase(path?: string): Promise<void> {
  const filePath =
    path ||
    (await open({
      filters: [{ name: "JSON", extensions: ["json"] }],
      multiple: false,
      directory: false,
    }));

  if (filePath) {
    const { importInto: importDexieDB } = await import("dexie-export-import");
    const file = await readFile(filePath);
    const blob = new Blob([file], { type: "application/json" });
    await importDexieDB(db, blob, {
      clearTablesBeforeImport: false,
      overwriteValues: true,
      acceptVersionDiff: true,
    });
  }
}

async function rotateBackups() {
  try {
    const entries = await readDir(BACKUP_DIR, {
      baseDir: BaseDirectory.Document,
    });

    // Sort backups by date (newest first)
    const backups = entries
      .filter((entry) => entry.name?.endsWith(".json"))
      .sort((a, b) => {
        const aTime = a.name?.match(/backup-(.+)\.json/)?.[1] || "";
        const bTime = b.name?.match(/backup-(.+)\.json/)?.[1] || "";
        return bTime.localeCompare(aTime);
      });

    // Remove oldest backups if we have more than MAX_BACKUPS
    if (backups.length > MAX_BACKUPS) {
      const toRemove = backups.slice(MAX_BACKUPS);
      for (const backup of toRemove) {
        if (backup.name) {
          const path = `${BACKUP_DIR}/${backup.name}`;
          await remove(path, { baseDir: BaseDirectory.Document });
        }
      }
    }
  } catch (error) {
    console.error("Failed to rotate backups:", error);
  }
}

let backupInterval: number | null = null;

export function startAutomaticBackups() {
  if (backupInterval) return;

  // Create initial backup
  createBackup();

  backupInterval = workerTimers.setInterval(
    () => {
      createBackup();
    },
    60 * 60 * 1000,
  );
}

export function stopAutomaticBackups() {
  if (backupInterval) {
    workerTimers.clearInterval(backupInterval);
    backupInterval = null;
  }
}
