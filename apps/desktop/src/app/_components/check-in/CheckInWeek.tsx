"use client";

import type { CheckIn } from "@/database/db";
import { endOfWeek, format } from "date-fns";
import { CheckInEntry } from "./CheckInEntry";

interface CheckInWeekProps {
  weekStart: string;
  checkIns: CheckIn[];
}

export function CheckInWeek({ weekStart, checkIns }: CheckInWeekProps) {
  const startDate = new Date(weekStart);
  const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">
        {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
      </h3>
      {checkIns.map((checkIn, index) => (
        <CheckInEntry key={checkIn.id || index} checkIn={checkIn} />
      ))}
    </div>
  );
}
