import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Progress } from "@repo/ui/components/ui/progress";
import { useToast } from "@repo/ui/hooks/use-toast";
import { relaunch } from "@tauri-apps/plugin-process";
import { type Update, check } from "@tauri-apps/plugin-updater";
import { useCallback, useEffect, useRef, useState } from "react";

export function Updater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    currentVersion: string;
    version: string;
    date: string;
    body: string;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);
  const { toast } = useToast();

  const hasCheckedForUpdates = useRef(false);
  const lastProgressUpdate = useRef(0);

  const { automaticUpdatesEnabled, automaticDownloadEnabled } =
    useSettingsStore();

  const checkForUpdates = useCallback(async () => {
    if (downloading) return;

    try {
      const update = await check();
      if (!update) return;

      const updateData = {
        version: update.version,
        date: update.date?.slice(0, 10) || "",
        body: update.body || "",
        currentVersion: update.currentVersion,
      };

      setUpdateInfo(updateData);

      if (automaticDownloadEnabled) {
        setDownloading(true);
        await downloadAndInstallUpdate(update);
      } else {
        promptUserForDownload(update);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Check Failed",
        description: "Failed to check for updates",
      });
    }
  }, [toast, downloading, automaticDownloadEnabled]);

  const downloadAndInstallUpdate = async (update: Update) => {
    try {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength ?? 0;
            break;
          case "Progress": {
            downloaded += event.data.chunkLength;
            const newProgress =
              contentLength > 0
                ? Math.round((downloaded / contentLength) * 100)
                : 0;
            setProgress(newProgress);
            break;
          }
          case "Finished":
            console.log("Finished");
            setShowRestartPrompt(true);

            if (!updateAvailable) {
              toast({
                title: "Update Available",
                description: (
                  <div className="flex flex-col gap-2">
                    <p>Restart to apply the update.</p>
                    <a
                      href="https://focu.featurebase.app/changelog"
                      className="text-blue-500 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Changelog
                    </a>
                  </div>
                ),
                action: <Button onClick={handleRestart}>Restart Now</Button>,
              });
            }
            break;
        }
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to install update",
      });
      setDownloading(false);
      setUpdateAvailable(false);
    }
  };

  const promptUserForDownload = (update: Update) => {
    const { dismiss } = toast({
      title: "Update Available",
      description: (
        <div className="flex flex-col gap-2 whitespace-pre-line">
          Version {update.version} is ready to download
          <a
            href="https://focu.featurebase.app/changelog"
            className="text-blue-500 underline"
            target="_blank"
            rel="noreferrer"
          >
            View Changelog
          </a>
        </div>
      ),
      action: (
        <Button
          onClick={async () => {
            setUpdateAvailable(true);
            setDownloading(true);
            await downloadAndInstallUpdate(update);
          }}
        >
          Download Now
        </Button>
      ),
    });
  };

  const handleRestart = async () => {
    try {
      await relaunch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Restart Failed",
        description: "Failed to restart the application",
      });
    }
  };

  // Add this callback to handle when user clicks "Later" on the restart prompt
  const handlePostponedRestart = useCallback(() => {
    setShowRestartPrompt(false);
    setDownloading(false);
    setProgress(0);
    setUpdateAvailable(false);
  }, []);

  useEffect(() => {
    if (!automaticUpdatesEnabled || hasCheckedForUpdates.current) return;

    checkForUpdates();
    hasCheckedForUpdates.current = true;
  }, [checkForUpdates, automaticUpdatesEnabled]);

  return (
    <Dialog
      open={updateAvailable}
      onOpenChange={(open) => {
        if (downloading) return;
        setUpdateAvailable(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {showRestartPrompt ? "Restart Required" : "Update Available"}
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-2">
              <p>
                Release date:{" "}
                {new Date(updateInfo?.date || "").toLocaleDateString()}
              </p>
              <p>New version: {updateInfo?.version}</p>
              <p>Your version: {updateInfo?.currentVersion}</p>
              <a
                href="https://focu.featurebase.app/changelog"
                className="text-blue-500 underline"
                target="_blank"
                rel="noreferrer"
              >
                View Changelog
              </a>
              {showRestartPrompt && (
                <p className="mt-2">
                  The update has been downloaded and is ready to install. Would
                  you like to restart the application now?
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {!showRestartPrompt && (
          <div className="py-4">
            {updateInfo?.body && (
              <>
                <h4 className="mb-2 text-sm font-medium">Release Notes:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {updateInfo?.body}
                </p>
              </>
            )}

            {downloading && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {progress}%
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {showRestartPrompt && (
            <Button
              variant="outline"
              onClick={() => {
                if (showRestartPrompt) {
                  handlePostponedRestart();
                } else {
                  setUpdateAvailable(false);
                }
              }}
              disabled={downloading && !showRestartPrompt}
            >
              Later
            </Button>
          )}
          <Button
            onClick={showRestartPrompt ? handleRestart : checkForUpdates}
            disabled={downloading && !showRestartPrompt}
          >
            {showRestartPrompt
              ? "Restart Now"
              : downloading
                ? "Installing..."
                : "Install Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
