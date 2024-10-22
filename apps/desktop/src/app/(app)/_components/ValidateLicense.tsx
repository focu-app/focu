import { useLicenseStore } from "@/app/store/licenseStore";
import { Button } from "@repo/ui/components/ui/button";

export function ValidateLicense() {
  const { validateLicense } = useLicenseStore();

  return (
    <Button
      onClick={() => validateLicense("42B9B8BF-5128-4CFD-B48D-040691928026")}
    >
      ValidateLicense
    </Button>
  );
}
