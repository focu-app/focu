import { addHours, differenceInDays, differenceInHours } from "date-fns";
import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LicenseValidationResult =
  | { status: 'valid'; instanceId: string }
  | { status: 'invalid'; reason: string }
  | { status: 'error'; message: string };

export interface LicenseStoreState {
  validateLicense: (licenseKey: string) => Promise<LicenseValidationResult>;
  trialStartDate: string;
  instanceId: string | null;
  isLicenseDialogOpen: boolean;
  isTrialExpired: () => boolean;
  trialTimeLeft: () => number;
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
              "https://focu.app/api/check-license-key",
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
            set({ instanceId: null });
            return { status: 'invalid', reason: data.message || 'Unknown error' };
          } catch (error) {
            console.error("Error validating license", error);
            return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error occurred' };
          }
        },
        trialStartDate: new Date().toISOString(),
        instanceId: null,
        isLicenseDialogOpen: false,
        openLicenseDialog: () => {
          if (!get().instanceId) {
            set({ isLicenseDialogOpen: true });
          }
        },
        isTrialExpired: () => {
          if (!get().trialStartDate) {
            set({ trialStartDate: new Date().toISOString() });
            return false;
          }
          return differenceInDays(new Date(), get().trialStartDate) >= 3;
        },
        trialTimeLeft: () => {

          const { trialStartDate } = get();

          console.log("trialTimeLeft", trialStartDate, new Date().toISOString());
          if (!trialStartDate) {
            return 0;
          }
          return differenceInHours(addHours(new Date(trialStartDate), 72), new Date());
        },
        closeLicenseDialog: () => {
          if (get().instanceId) {
            set({ isLicenseDialogOpen: false });
          }

          if (get().isTrialExpired()) {
            set({ isLicenseDialogOpen: true });
          } else {
            set({ isLicenseDialogOpen: false });
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
