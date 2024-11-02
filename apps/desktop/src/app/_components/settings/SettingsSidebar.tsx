import { Button } from "@repo/ui/components/ui/button";
import type { Category } from "./Settings";

export function SettingsSidebar({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}) {
  const categories: Category[] = [
    "General",
    "AI",
    "Pomodoro",
    "Shortcuts",
    "Templates",
  ];

  return (
    <div className="w-48 p-4 h-full bg-accent/50 rounded">
      <div className="flex flex-col space-y-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "outline" : "ghost"}
            className="justify-start"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
