import { useEffect, useState } from "react";
import { useLicenseStore } from "../store/licenseStore";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { useToast } from "@repo/ui/hooks/use-toast";

export function LicenseKeyDialog() {
  const [licenseKey, setLicenseKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const {
    validateLicense,
    isLicenseDialogOpen,
    setIsLicenseDialogOpen,
    instanceId,
  } = useLicenseStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!instanceId) {
      setIsLicenseDialogOpen(true);
    }
  }, [instanceId, setIsLicenseDialogOpen]);

  const handleSubmit = async () => {
    setIsValidating(true);
    try {
      const result = await validateLicense(licenseKey);
      switch (result.status) {
        case "valid":
          toast({
            title: "License validated",
            description: "Your license key has been successfully validated.",
            duration: 3000,
          });
          setIsLicenseDialogOpen(false);
          break;
        case "invalid":
          toast({
            title: "Validation failed",
            description: `Failed to validate the license key: ${result.reason}`,
            variant: "destructive",
            duration: 3000,
          });
          break;
        case "error":
          toast({
            title: "Validation error",
            description: `An error occurred: ${result.message}`,
            variant: "destructive",
            duration: 3000,
          });
          break;
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter License Key</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
