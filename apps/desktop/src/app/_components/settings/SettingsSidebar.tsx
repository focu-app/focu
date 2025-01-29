import { Button } from "@repo/ui/components/ui/button";
import type { SettingsCategory } from "@/app/store";
import {
  Settings,
  Brain,
  Timer,
  Keyboard,
  FileText,
  ClipboardCheck,
  Home,
  MessageSquare,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";

export function SettingsSidebar({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: SettingsCategory;
  setActiveCategory: (category: SettingsCategory) => void;
}) {
  const categoryConfig = [
    { name: "General", icon: Settings },
    { name: "Homescreen", icon: Home },
    { name: "AI Models", icon: Brain },
    { name: "Chat", icon: MessageSquare },
    { name: "Pomodoro", icon: Timer },
    { name: "Check-in", icon: ClipboardCheck },
    { name: "Shortcuts", icon: Keyboard },
  ] as const;

  return (
    <div className="w-48 p-4 h-full bg-background/40 dark:bg-background/70 rounded">
      <div className="flex flex-col space-y-2">
        {categoryConfig.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            variant="ghost"
            className={cn(
              "justify-start gap-2 font-normal",
              activeCategory === name
                ? "bg-primary/10 hover:bg-primary/10 font-semibold"
                : "",
            )}
            onClick={() => setActiveCategory(name as SettingsCategory)}
          >
            <Icon className="h-4 w-4" />
            {name}
          </Button>
        ))}
      </div>
    </div>
  );
}
