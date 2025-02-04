"use client";

import { exportDatabase, importDatabase } from "@/database/backup-manager";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Download, FolderOpen } from "lucide-react";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { documentDir } from "@tauri-apps/api/path";
import { Suspense, useState, useEffect } from "react";

function BackupPath() {
  const [path, setPath] = useState("");

  useEffect(() => {
    documentDir().then((dir) => setPath(`${dir}/Focu`));
  }, []);

  if (!path) return null;
  return <span className="text-xs text-muted-foreground">{path}</span>;
}

export function DataSettings() {
  const { toast } = useToast();

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
      const documentsDir = await documentDir();
      const backupsPath = `${documentsDir}/Focu`;
      await revealItemInDir(backupsPath);
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

  return (
    <SettingsCard title="Data Settings" onSave={handleSave}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Export Data</h2>
          <SettingItem
            label="Export Database"
            tooltip="Export your database to a JSON file that you can use for backup or transfer to another device"
          >
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </SettingItem>
          <SettingItem
            label="Import Database"
            tooltip="Import your database from a JSON file that you can use for backup or transfer to another device"
          >
            <Button onClick={handleImport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </SettingItem>
          <SettingItem label="Backups Folder">
            <div className="flex flex-col gap-1">
              <Button onClick={openBackupsFolder} variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-2" />
                Reveal in Finder
              </Button>
              <Suspense>
                <BackupPath />
              </Suspense>
            </div>
          </SettingItem>
        </div>
      </div>
    </SettingsCard>
  );
}
