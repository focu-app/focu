"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { emotionCategories } from "@/database/db";
import { EmotionCategory } from "./EmotionCategory";
import type { CheckIn } from "@/database/db";

interface EmotionStatsProps {
  checkIns: CheckIn[];
}

export function EmotionStats({ checkIns }: EmotionStatsProps) {
  // Process emotions data for visualization
  const emotionStats = checkIns?.reduce(
    (acc, checkIn) => {
      for (const { categoryId, selectedOptions } of checkIn.emotions) {
        if (!acc[categoryId]) {
          acc[categoryId] = {};
        }

        for (const optionId of selectedOptions) {
          acc[categoryId][optionId] = (acc[categoryId][optionId] || 0) + 1;
        }
      }
      return acc;
    },
    {} as Record<string, Record<string, number>>,
  );

  return (
    <Card className="flex-1 self-start">
      <CardHeader>
        <CardTitle>Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {emotionCategories.map((category) => (
            <EmotionCategory
              key={category.id}
              category={category}
              stats={emotionStats?.[category.id] || {}}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
