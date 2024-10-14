import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { genericPersona, morningIntentionPersona, eveningReflectionPersona } from "@/lib/persona";

export type TemplateType = "generic" | "morningIntention" | "eveningReflection";

export type Template = {
  id: string;
  name: string;
  content: string;
  type: TemplateType;
  isDefault: boolean;
};

interface TemplateStore {
  templates: Template[];
  addTemplate: (template: Omit<Template, "id" | "isDefault">) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  setDefaultTemplate: (id: string) => void;
  restoreDefaults: () => void;
}

const defaultTemplates: Template[] = [
  { id: "default-generic", name: "Generic Chat", content: genericPersona, type: "generic", isDefault: true },
  { id: "default-morning", name: "Morning Intention", content: morningIntentionPersona, type: "morningIntention", isDefault: true },
  { id: "default-evening", name: "Evening Reflection", content: eveningReflectionPersona, type: "eveningReflection", isDefault: true },
];

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [...defaultTemplates],
      addTemplate: (template) => {
        set((state) => {
          const newTemplate: Template = {
            ...template,
            id: Date.now().toString(),
            isDefault: false,
          };
          return { templates: [...state.templates, newTemplate] };
        });
      },
      removeTemplate: (id: string) => {
        set((state) => {
          const templateToRemove = state.templates.find((t) => t.id === id);
          if (!templateToRemove || templateToRemove.isDefault) {
            return state; // Don't remove if it's a default template
          }
          return { templates: state.templates.filter((t) => t.id !== id) };
        });
      },
      updateTemplate: (id: string, updates: Partial<Template>) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      setDefaultTemplate: (id: string) => {
        set((state) => {
          const templateToSetDefault = state.templates.find((t) => t.id === id);
          if (!templateToSetDefault) return state;

          return {
            templates: state.templates.map((t) =>
              t.type === templateToSetDefault.type
                ? { ...t, isDefault: t.id === id }
                : t
            ),
          };
        });
      },
      restoreDefaults: () => {
        set({ templates: [...defaultTemplates] });
      },
    }),
    {
      name: "template-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useTemplateStoreWithStorageDOMEvents = withStorageDOMEvents(useTemplateStore);
