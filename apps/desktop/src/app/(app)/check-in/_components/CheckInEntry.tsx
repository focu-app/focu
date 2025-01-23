"use client";

import { Button } from "@repo/ui/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { emotionCategories, type CheckIn } from "@/database/db";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useCheckInStore } from "@/app/store/checkinStore";

interface CheckInEntryProps {
  checkIn: CheckIn;
}

export function CheckInEntry({ checkIn }: CheckInEntryProps) {
  const router = useRouter();
  const setCheckInToDelete = useCheckInStore(
    (state) => state.setCheckInToDelete,
  );

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-muted-foreground">
          {format(new Date(checkIn.createdAt!), "PPp")}
        </span>
        <div className="flex gap-2">
          {checkIn.chatId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => router.push(`/chat?id=${checkIn.chatId}`)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Chat</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => checkIn.id && setCheckInToDelete(checkIn.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete Check-in</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="space-y-2">
        {checkIn.emotions.map(({ categoryId, selectedOptions }) => {
          const category = emotionCategories.find((c) => c.id === categoryId);
          if (!category || !selectedOptions.length) return null;
          return (
            <div key={categoryId} className="flex flex-wrap gap-2">
              <span className="text-sm font-medium py-1">
                {category?.emoji}
              </span>
              {selectedOptions.map((optionId) => {
                const option = category?.options.find((o) => o.id === optionId);
                if (!option) return null;
                return (
                  <span
                    key={optionId}
                    className="inline-flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-md"
                  >
                    {option?.emoji} {option?.label}
                  </span>
                );
              })}
            </div>
          );
        })}
        {checkIn.note && (
          <p className="text-sm text-muted-foreground mt-2">{checkIn.note}</p>
        )}
      </div>
    </div>
  );
}
