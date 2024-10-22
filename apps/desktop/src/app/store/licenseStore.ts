import { temporal } from "zundo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface LicenseStoreState {
  validateLicense: (licenseKey: string) => Promise<void>;
  instanceId: string | null;
}

export const useLicenseStore = create<LicenseStoreState>()(
  persist(
    temporal(
      (set, get) => ({
        validateLicense: async (licenseKey: string) => {
          const { instanceId } = get();
          const result = await fetch(
            "http://localhost:3001/api/check-license-key",
            {
              method: "POST",
              body: JSON.stringify({ licenseKey, instanceId }),
            }
          );
          console.log(result.status);
          if (result.status === 200) {
            console.log("License is valid");
            const data = await result.json();
            set({ instanceId: data.instanceId });
          } else {
            console.log("License is invalid");
          }
        },
        instanceId: null,
      }),
      { limit: 10 },
    ),
    {
      name: "license-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
