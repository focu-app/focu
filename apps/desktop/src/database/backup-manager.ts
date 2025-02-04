import {
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
import { useBackupStore } from "@/store/backupStore";
import type { BackupInterval } from "@/store/backupStore";

function getBackupIntervalMs(interval: BackupInterval): number {
  switch (interval) {
    case "hourly":
      return 60 * 60 * 1000; // 1 hour
    case "twice-daily":
      return 12 * 60 * 60 * 1000; // 12 hours
    case "daily":
      return 24 * 60 * 60 * 1000; // 24 hours
    default:
      return 24 * 60 * 60 * 1000;
  }
}

export async function setupBackupManager() {
  const store = useBackupStore.getState();
  if (!store.backupDirectory) {
    await store.initializeBackupDirectory();
  }
  // Ensure backup directory exists
  try {
    const dirExists = await exists(store.backupDirectory);
    if (!dirExists) {
      // Create directory recursively
      await mkdir(store.backupDirectory, { recursive: true });
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
    const backupName = `Focu Backup ${date}.json`;
    const store = useBackupStore.getState();
    const backupPath = customPath || `${store.backupDirectory}/${backupName}`;

    // Export the database
    const blob = await exportDexieDB(db);
    const arrayBuffer = await blob.arrayBuffer();

    // Write the backup file
    await writeFile(backupPath, new Uint8Array(arrayBuffer));

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
      // The risk here is that migrations are not re-run
      acceptVersionDiff: true,
    });
  }
}

async function rotateBackups() {
  try {
    const store = useBackupStore.getState();
    const entries = await readDir(store.backupDirectory);

    // Sort backups by date (newest first)
    const backups = entries
      .filter((entry) => entry.name?.endsWith(".json"))
      .sort((a, b) => {
        const aTime = a.name?.match(/backup-(.+)\.json/)?.[1] || "";
        const bTime = b.name?.match(/backup-(.+)\.json/)?.[1] || "";
        return bTime.localeCompare(aTime);
      });

    // Remove oldest backups if we have more than maxBackups
    if (backups.length > store.maxBackups) {
      const toRemove = backups.slice(store.maxBackups);
      for (const backup of toRemove) {
        if (backup.name) {
          const path = `${store.backupDirectory}/${backup.name}`;
          await remove(path);
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

  const { automaticBackupsEnabled, backupInterval: interval } =
    useBackupStore.getState();

  if (!automaticBackupsEnabled) return;

  // Create initial backup
  createBackup();

  const intervalMs = getBackupIntervalMs(interval);
  backupInterval = workerTimers.setInterval(() => {
    createBackup();
  }, intervalMs);
}

export function stopAutomaticBackups() {
  if (backupInterval) {
    workerTimers.clearInterval(backupInterval);
    backupInterval = null;
  }
}
