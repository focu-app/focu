import {
  eveningReflectionPersona,
  genericPersona,
  morningIntentionPersona,
  yearEndReflectionPersona,
} from "@/lib/persona";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TemplateType =
  | "generic"
  | "morningIntention"
  | "eveningReflection"
  | "yearEndReflection";

export type Template = {
  id: string;
  name: string;
  content: string;
  type: TemplateType;
  isDefault: boolean;
  isActive: boolean;
};

interface TemplateStore {
  templates: Template[];
  isTemplateDialogOpen: boolean;
  addTemplate: (
    template: Omit<Template, "id" | "isDefault" | "isActive">,
  ) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  setActiveTemplate: (id: string) => void;
  restoreDefaults: () => void;
  setIsTemplateDialogOpen: (isOpen: boolean) => void;
}

export const preInstalledTemplates: Template[] = [
  {
    id: "default-generic",
    name: "Generic Chat",
    content: genericPersona,
    type: "generic",
    isDefault: true,
    isActive: true,
  },
  {
    id: "default-morning",
    name: "Morning Intention",
    content: morningIntentionPersona,
    type: "morningIntention",
    isDefault: true,
    isActive: true,
  },
  {
    id: "default-evening",
    name: "Evening Reflection",
    content: eveningReflectionPersona,
    type: "eveningReflection",
    isDefault: true,
    isActive: true,
  },
  {
    id: "default-year-end",
    name: "Year-End Reflection",
    content: yearEndReflectionPersona,
    type: "yearEndReflection",
    isDefault: true,
    isActive: true,
  },
];

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [...preInstalledTemplates],
      isTemplateDialogOpen: false,
      addTemplate: (template) => {
        set((state) => {
          const newTemplate: Template = {
            ...template,
            id: Date.now().toString(),
            isDefault: false,
            isActive: false,
          };
          return { templates: [...state.templates, newTemplate] };
        });
      },
      removeTemplate: (id: string) => {
        set((state) => {
          const templateToRemove = state.templates.find((t) => t.id === id);
          if (!templateToRemove || templateToRemove.isDefault) {
            return state; // Don't remove if it's a pre-installed template
          }

          const updatedTemplates = state.templates.filter((t) => t.id !== id);

          // Check if there are any non-default active templates of the same type
          const hasActiveNonDefaultOfType = updatedTemplates.some(
            (t) =>
              t.type === templateToRemove.type && !t.isDefault && t.isActive,
          );

          // If no active non-default templates of the type remain, set the default to active
          if (!hasActiveNonDefaultOfType) {
            return {
              templates: updatedTemplates.map((t) =>
                t.type === templateToRemove.type && t.isDefault
                  ? { ...t, isActive: true }
                  : t,
              ),
            };
          }

          return { templates: updatedTemplates };
        });
      },
      updateTemplate: (id: string, updates: Partial<Template>) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, isDefault: t.isDefault } : t,
          ),
        }));
      },
      setActiveTemplate: (id: string) => {
        set((state) => {
          const templateToSetActive = state.templates.find((t) => t.id === id);
          if (!templateToSetActive) return state;

          return {
            templates: state.templates.map((t) =>
              t.type === templateToSetActive.type
                ? { ...t, isActive: t.id === id }
                : t,
            ),
          };
        });
      },
      restoreDefaults: () => {
        set((state) => ({
          templates: [
            ...preInstalledTemplates,
            ...state.templates.filter((t) => !t.isDefault),
          ],
        }));
      },
      setIsTemplateDialogOpen: (isOpen: boolean) => {
        set({ isTemplateDialogOpen: isOpen });
      },
    }),
    {
      name: "template-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useTemplateStoreWithStorageDOMEvents =
  withStorageDOMEvents(useTemplateStore);
