import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useToast } from "@repo/ui/hooks/use-toast";
import { useEffect, useState } from "react";
import { useLicenseStore } from "../store/licenseStore";

export function LicenseKeyDialog() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const {
    validateLicense,
    isLicenseDialogOpen,
    openLicenseDialog,
    closeLicenseDialog,
    isTrialExpired,
    trialStartDate,
    instanceId,
  } = useLicenseStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!instanceId && isTrialExpired()) {
      openLicenseDialog();
    }
  }, [instanceId, openLicenseDialog, isTrialExpired, trialStartDate]);

  const handleSubmit = async () => {
    setIsValidating(true);
    try {
      const result = await validateLicense(licenseKey);
      switch (result.status) {
        case "valid":
          toast({
            title: "License validated",
            description: "Your license key has been successfully validated.",
          });
          closeLicenseDialog();
          break;
        case "invalid":
          toast({
            title: "Validation failed",
            description: "Failed to validate the license key.",
            variant: "destructive",
          });
          break;
        case "error":
          toast({
            title: "Validation error",
            description: `An error occurred: ${result.message}`,
            variant: "destructive",
          });
          break;
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isLicenseDialogOpen} onOpenChange={closeLicenseDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter License Key</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            Please go to{" "}
            <a
              href="https://focu.app/pricing?utm_source=focu-desktop"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline"
            >
              https://focu.app
            </a>{" "}
            to buy your license key.
          </p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="license-key" className="text-right">
              License Key
            </Label>
            <Input
              id="license-key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isValidating}>
            {isValidating ? "Validating..." : "Validate License"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
