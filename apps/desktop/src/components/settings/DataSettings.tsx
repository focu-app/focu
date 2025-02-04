"use client";

import { exportDB } from "@/database/export";
import { Button } from "@repo/ui/components/ui/button";
import { useToast } from "@repo/ui/hooks/use-toast";
import { Download } from "lucide-react";
import { SettingItem } from "./SettingItem";
import { showSettingsSavedToast } from "./Settings";
import { SettingsCard } from "./SettingsCard";

export function DataSettings() {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const success = await exportDB();
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
        </div>
      </div>
    </SettingsCard>
  );
}
