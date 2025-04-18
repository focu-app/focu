"use client";

import {
  exportDatabase,
  importDatabase,
  setupBackupManager,
  createBackup,
  stopAutomaticBackups,
  startAutomaticBackups,
} from "@/database/backup-manager";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { FolderOpen, Upload, Download } from "lucide-react";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { useEffect } from "react";
import { useBackupStore } from "@/store/backupStore";
import type { BackupInterval } from "@/store/backupStore";
import { Switch } from "@repo/ui/components/ui/switch";
import { Input } from "@repo/ui/components/ui/input";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";

const BACKUP_INTERVALS: { value: BackupInterval; label: string }[] = [
  { value: "hourly", label: "Every hour" },
  { value: "twice-daily", label: "Twice a day" },
  { value: "daily", label: "Once a day" },
];

function BackupPath({ path }: { path: string }) {
  if (!path) return null;
  return <span className="text-xs text-muted-foreground">{path}</span>;
}

export function DataSettings() {
  const { toast } = useToast();
  const {
    automaticBackupsEnabled,
    backupInterval,
    maxBackups,
    backupDirectory,
    setAutomaticBackupsEnabled,
    setBackupInterval,
    setMaxBackups,
    setBackupDirectory,
    initializeBackupDirectory,
  } = useBackupStore();

  useEffect(() => {
    if (!backupDirectory) {
      initializeBackupDirectory();
    }
  }, [backupDirectory, initializeBackupDirectory]);

  const handleExport = async () => {
    try {
      const success = await exportDatabase();
      if (success) {
        toast({
          title: "Database exported successfully",
          description: "Your database has been exported successfully",
        });
      }
    } catch (error) {
      console.error("Failed to export database:", error);
      toast({
        title: "Error",
        description: "Failed to export database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    try {
      await importDatabase();
      toast({
        title: "Database imported successfully",
        description: "Your database has been imported successfully",
      });
    } catch (error) {
      console.error("Failed to import database:", error);
      toast({
        title: "Error",
        description: "Failed to import database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openBackupsFolder = async () => {
    try {
      if (!backupDirectory) {
        throw new Error("Backup directory not initialized");
      }
      await revealItemInDir(backupDirectory);
    } catch (error) {
      console.error("Failed to open backups folder:", error);
      toast({
        title: "Error",
        description: "Failed to open backups folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    showSettingsSavedToast(toast);
  };

  const handleChangeBackupDirectory = async () => {
    try {
      const dir = await open({
        directory: true,
        multiple: false,
      });
      if (dir && typeof dir === "string") {
        setBackupDirectory(dir);
        await setupBackupManager(); // Re-initialize the backup directory

        // Create an immediate backup in the new location
        const backupSuccess = await createBackup();
        if (!backupSuccess) {
          throw new Error("Failed to create initial backup");
        }

        toast({
          title: "Backup directory changed",
          description:
            "Your backup directory has been updated and initial backup created",
        });
      }
    } catch (error) {
      console.error("Failed to change backup directory:", error);
      toast({
        title: "Error",
        description: "Failed to change backup directory. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsCard title="Data Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Automatic Backups</h2>

          <SettingItem
            label="Automatic Backups"
            tooltip="Enable or disable automatic backups of your database"
            description="Backups will be created in the background without interrupting your work. In addition to this, a backup will be created every time you start the app.Only chats, check-ins, tasks and notes will be saved. App specific settings will not be saved."
          >
            <Switch
              checked={automaticBackupsEnabled}
              onCheckedChange={setAutomaticBackupsEnabled}
            />
          </SettingItem>
          {automaticBackupsEnabled && (
            <>
              <SettingItem
                label="Backup Frequency"
                tooltip="How often should automatic backups be created. In addition to this, a backup will be created every time you start the app."
              >
                <Select
                  value={backupInterval}
                  onValueChange={(value: BackupInterval) => {
                    setBackupInterval(value);
                    stopAutomaticBackups();
                    startAutomaticBackups();
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKUP_INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SettingItem>
              <SettingItem
                label="Maximum Backups"
                tooltip="Maximum number of backup files to keep"
              >
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={maxBackups}
                  onChange={(e) => setMaxBackups(Number(e.target.value))}
                  className="w-24"
                />
              </SettingItem>
            </>
          )}
        </div>
        <h2 className="text-lg font-semibold">Backup Settings</h2>

        <SettingItem
          label="Manual Backup"
          tooltip="Create or restore a backup of your database"
          description="Restoring a backup will overwrite your current database with the imported data."
        >
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              {/* Upload icon still makes more sense here */}
              <Upload className="h-4 w-4 mr-2" />
              Manual Backup
            </Button>
            <Button onClick={handleImport} variant="outline" size="sm">
              {/* Download icon still makes more sense here */}
              <Download className="h-4 w-4 mr-2" />
              Restore Backup
            </Button>
          </div>
        </SettingItem>
        <SettingItem
          label="Backup Directory"
          tooltip="Choose where your backups will be stored"
        >
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Button
                onClick={handleChangeBackupDirectory}
                variant="outline"
                size="sm"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Change Directory
              </Button>
              {backupDirectory && (
                <Button
                  onClick={openBackupsFolder}
                  variant="secondary"
                  size="sm"
                >
                  Show in Finder
                </Button>
              )}
            </div>
            <BackupPath path={backupDirectory} />
          </div>
        </SettingItem>
      </div>
    </SettingsCard>
  );
}
