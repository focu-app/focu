"use client";

import { EmotionCategory as EmotionCategoryType } from "@/database/db";

interface EmotionCategoryProps {
  category: EmotionCategoryType;
  stats: Record<string, number>;
}

export function EmotionCategory({ category, stats }: EmotionCategoryProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        {category.emoji} {category.label}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {category.options.map((option) => {
          const count = stats?.[option.id] || 0;
          const hasEntries = count > 0;
          return (
            <div
              key={option.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                hasEntries ? "bg-muted" : "bg-background"
              }`}
            >
              <span className="flex items-center gap-2 text-sm">
                {option.emoji} {option.label}
              </span>
              <span className="text-sm font-medium">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
