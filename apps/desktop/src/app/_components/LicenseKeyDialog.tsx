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
  }, [instanceId]);

  const handleSubmit = async () => {
    try {
      const isValid = await validateLicense(licenseKey);
      if (isValid) {
        toast({
          title: "License validated",
          description: "Your license key has been successfully validated.",
          duration: 3000,
        });
        setIsLicenseDialogOpen(false);
      } else {
        toast({
          title: "Validation failed",
          description: "Failed to validate the license key. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "Failed to validate the license key. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
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
          <Button onClick={handleSubmit}>Validate License</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
