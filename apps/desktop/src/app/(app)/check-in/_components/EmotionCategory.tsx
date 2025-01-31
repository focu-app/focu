"use client";

import type { EmotionCategory as EmotionCategoryType } from "@/database/db";
import { BarList } from "@repo/ui/components/ui/bar-list";

interface EmotionCategoryProps {
  category: EmotionCategoryType;
  stats: Record<string, number>;
}

export function EmotionCategory({ category, stats }: EmotionCategoryProps) {
  const barData = category.options.map((option) => ({
    name: `${option.emoji} ${option.label}`,
    value: stats?.[option.id] || 0,
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        {category.emoji} {category.label}
      </h3>
      <BarList data={barData} valueFormatter={(value) => value.toString()} />
    </div>
  );
}
