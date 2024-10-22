import { differenceInDays } from "date-fns";
import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Define a custom type for license validation result
type LicenseValidationResult =
  | { status: 'valid'; instanceId: string }
  | { status: 'invalid'; reason: string }
  | { status: 'error'; message: string };

export interface LicenseStoreState {
  validateLicense: (licenseKey: string) => Promise<LicenseValidationResult>;
  trialStartDate: Date;
  instanceId: string | null;
  isLicenseDialogOpen: boolean;
  openLicenseDialog: () => void;
  closeLicenseDialog: () => void;
}

export const useLicenseStore = create<LicenseStoreState>()(
  persist(
    temporal(
      (set, get) => ({
        validateLicense: async (licenseKey: string): Promise<LicenseValidationResult> => {
          const { instanceId } = get();

          try {
            const response = await fetch(
              "http://localhost:3001/api/check-license-key",
              {
                method: "POST",
                body: JSON.stringify({ licenseKey, instanceId }),
              }
            );

            if (!response.ok) {
              return { status: 'invalid', reason: 'Server returned an error' };
            }

            const data = await response.json();

            if (response.status === 200 && data.instanceId) {
              set({ instanceId: data.instanceId });
              return { status: 'valid', instanceId: data.instanceId };
            }
            return { status: 'invalid', reason: data.message || 'Unknown error' };
          } catch (error) {
            console.error("Error validating license", error);
            return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error occurred' };
          }
        },
        trialStartDate: new Date(),
        instanceId: null,
        isLicenseDialogOpen: false,
        openLicenseDialog: () => {
          set({ isLicenseDialogOpen: true });
        },
        closeLicenseDialog: () => {
          if (get().instanceId) {
            set({ isLicenseDialogOpen: false });
          }

          // use date-fns to check if 3 days have passed
          if (differenceInDays(new Date(), get().trialStartDate) >= 3) {
            set({ isLicenseDialogOpen: true });
          }
        },
      }),
      { limit: 10 },
    ),
    {
      name: "license-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
