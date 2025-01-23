"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { emotionCategories } from "@/database/db";
import { EmotionCategory } from "./EmotionCategory";
import type { CheckIn } from "@/database/db";
import { useState } from "react";
import { subDays } from "date-fns";

interface EmotionStatsProps {
  checkIns: CheckIn[];
}

type TimeFrame = "7days" | "30days" | "all";

export function EmotionStats({ checkIns }: EmotionStatsProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("7days");

  // Filter check-ins based on timeframe
  const filteredCheckIns = checkIns.filter((checkIn) => {
    if (timeframe === "all") return true;

    const checkInDate = checkIn.date ? new Date(checkIn.date) : new Date();
    const cutoffDate = subDays(new Date(), timeframe === "7days" ? 7 : 30);

    return checkInDate >= cutoffDate;
  });

  // Process emotions data for visualization
  const emotionStats = filteredCheckIns?.reduce(
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Stats</CardTitle>
        <Select
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as TimeFrame)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
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
