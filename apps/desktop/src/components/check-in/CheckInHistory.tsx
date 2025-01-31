"use client";

import type { CheckIn } from "@/database/db";
import { useCheckInStore } from "@/store/checkinStore";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { format, startOfWeek } from "date-fns";
import { Check } from "lucide-react";
import { CheckInWeek } from "./CheckInWeek";

interface CheckInHistoryProps {
  checkIns: CheckIn[];
}

export function CheckInHistory({ checkIns }: CheckInHistoryProps) {
  const setIsCheckInOpen = useCheckInStore((state) => state.setIsCheckInOpen);

  // Group check-ins by week
  const groupedCheckIns = checkIns?.reduce(
    (acc, checkIn) => {
      const checkInDate = new Date(checkIn.createdAt!);
      const weekStart = startOfWeek(checkInDate, { weekStartsOn: 1 }); // Start week on Monday
      const weekKey = format(weekStart, "yyyy-MM-dd");

      if (!acc[weekKey]) {
        acc[weekKey] = [];
      }
      acc[weekKey].push(checkIn);
      return acc;
    },
    {} as Record<string, CheckIn[]>,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Check-in History</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCheckInOpen(true)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Check-in</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupedCheckIns &&
            Object.entries(groupedCheckIns)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([weekStart, weekCheckIns]) => (
                <CheckInWeek
                  key={weekStart}
                  weekStart={weekStart}
                  checkIns={weekCheckIns}
                />
              ))}
          {(!checkIns || checkIns.length === 0) && (
            <p className="text-muted-foreground text-center py-4">
              No recent check-ins found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
