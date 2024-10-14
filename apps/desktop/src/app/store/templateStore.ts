import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { withStorageDOMEvents } from "@/lib/withStorageDOMEvents";
import { genericPersona, morningIntentionPersona, eveningReflectionPersona } from "@/lib/persona";

type TemplateType = "generic" | "morningIntention" | "eveningReflection";

type Template = {
  id: string;
  name: string;
  content: string;
  type: TemplateType;
};

interface TemplateStore {
  defaultTemplates: Template[];
  templates: Template[];
  addTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  restoreDefaults: () => void;
}

const defaultTemplates: Template[] = [
  { id: "default-generic", name: "Generic Chat", content: genericPersona, type: "generic" },
  { id: "default-morning", name: "Morning Intention", content: morningIntentionPersona, type: "morningIntention" },
  { id: "default-evening", name: "Evening Reflection", content: eveningReflectionPersona, type: "eveningReflection" },
];

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      defaultTemplates,
      templates: [...defaultTemplates],
      addTemplate: (template: Template) => {
        set((state) => ({ templates: [...state.templates, template] }));
      },
      removeTemplate: (id: string) => {
        set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
      },
      updateTemplate: (id: string, updates: Partial<Template>) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },
      restoreDefaults: () => {
        set((state) => ({ templates: [...state.defaultTemplates] }));
      },
    }),
    {
      name: "template-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useTemplateStoreWithStorageDOMEvents = withStorageDOMEvents(useTemplateStore);
