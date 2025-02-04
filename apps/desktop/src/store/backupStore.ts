import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { documentDir } from "@tauri-apps/api/path";

export interface BackupState {
  automaticBackupsEnabled: boolean;
  backupIntervalHours: number;
  maxBackups: number;
  backupDirectory: string;
  setAutomaticBackupsEnabled: (enabled: boolean) => void;
  setBackupIntervalHours: (hours: number) => void;
  setMaxBackups: (count: number) => void;
  setBackupDirectory: (path: string) => void;
  initializeBackupDirectory: () => Promise<void>;
}

export const useBackupStore = create<BackupState>()(
  persist(
    temporal(
      (set) => ({
        automaticBackupsEnabled: true,
        backupIntervalHours: 1,
        maxBackups: 10,
        backupDirectory: "",
        setAutomaticBackupsEnabled: (enabled: boolean) =>
          set({ automaticBackupsEnabled: enabled }),
        setBackupIntervalHours: (hours: number) =>
          set({ backupIntervalHours: hours }),
        setMaxBackups: (count: number) => set({ maxBackups: count }),
        setBackupDirectory: (path: string) => set({ backupDirectory: path }),
        initializeBackupDirectory: async () => {
          const dir = await documentDir();
          set({ backupDirectory: `${dir}/Focu/backups` });
        },
      }),
      { limit: 10 },
    ),
    {
      name: "backup-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
