import { Button } from "@repo/ui/components/ui/button";
import type { Category } from "./Settings";
import { Settings, Brain, Timer, Keyboard, FileText } from "lucide-react";

export function SettingsSidebar({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}) {
  const categoryConfig = [
    { name: "General", icon: Settings },
    { name: "AI", icon: Brain },
    { name: "Pomodoro", icon: Timer },
    { name: "Shortcuts", icon: Keyboard },
    { name: "Templates", icon: FileText },
  ] as const;

  return (
    <div className="w-48 p-4 h-full bg-accent/50 rounded">
      <div className="flex flex-col space-y-2">
        {categoryConfig.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            variant={activeCategory === name ? "outline" : "ghost"}
            className="justify-start gap-2"
            onClick={() => setActiveCategory(name)}
          >
            <Icon className="h-4 w-4" />
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
