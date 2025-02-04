import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { documentDir } from "@tauri-apps/api/path";

export type BackupInterval = "hourly" | "twice-daily" | "daily";

export interface BackupState {
  automaticBackupsEnabled: boolean;
  backupInterval: BackupInterval;
  maxBackups: number;
  backupDirectory: string;
  setAutomaticBackupsEnabled: (enabled: boolean) => void;
  setBackupInterval: (interval: BackupInterval) => void;
  setMaxBackups: (count: number) => void;
  setBackupDirectory: (path: string) => void;
  initializeBackupDirectory: () => Promise<void>;
}

export const useBackupStore = create<BackupState>()(
  persist(
    temporal(
      (set) => ({
        automaticBackupsEnabled: true,
        backupInterval: "twice-daily",
        maxBackups: 10,
        backupDirectory: "",
        setAutomaticBackupsEnabled: (enabled: boolean) =>
          set({ automaticBackupsEnabled: enabled }),
        setBackupInterval: (interval: BackupInterval) =>
          set({ backupInterval: interval }),
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
