import {
  exportDB as exportDexieDB,
  importInto as importDexieDB,
} from "dexie-export-import";
import { save, open } from "@tauri-apps/plugin-dialog";
import { create, readFile } from "@tauri-apps/plugin-fs";
import { format } from "date-fns";

import { db } from "./db";

export async function exportDB() {
  const date = format(new Date(), "yyyy-MM-dd HH.mm.ss");
  const name = `Focu Backup ${date}.json`;

  const path = await save({
    filters: [{ name: "JSON", extensions: ["json"] }],
    defaultPath: name,
  });

  if (path) {
    const file = await create(path);
    const blob = await exportDexieDB(db);
    await file.write(new Uint8Array(await blob.arrayBuffer()));
    return true;
  }

  return false;
}

export async function importDB() {
  const path = await open({
    filters: [{ name: "JSON", extensions: ["json"] }],
    multiple: false,
    directory: false,
  });

  if (path) {
    const file = await readFile(path);
    const blob = new Blob([file], { type: "application/json" });
    await importDexieDB(db, blob, {
      clearTablesBeforeImport: false,
      overwriteValues: true,
      acceptVersionDiff: true,
    });
  }
}
