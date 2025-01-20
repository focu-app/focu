"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/db";
import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { emotionCategories } from "@/database/db";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import { CalendarIcon, Check, MessageSquare, Trash2 } from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { useCheckInStore } from "@/app/store/checkinStore";

export default function CheckInClient() {
  const router = useRouter();
  const { setIsCheckInOpen } = useCheckInStore();
  const [checkInToDelete, setCheckInToDelete] = useState<number | null>(null);

  // Fetch check-ins for the last 7 days
  const checkIns = useLiveQuery(async () => {
    return await db.checkIns.reverse().toArray();
  }, []);

  const handleDelete = async () => {
    if (checkInToDelete) {
      await db.checkIns.delete(checkInToDelete);
      setCheckInToDelete(null);
    }
  };

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
    <div className="flex flex-col h-full">
      <DateNavigationHeader />
      <ScrollArea className="flex-1">
        <div className="container mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Check-ins */}
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
                  <TooltipPortal>
                    <TooltipContent>New Check-in</TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkIns?.map((checkIn, index) => (
                    <div
                      key={checkIn.id || index}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(checkIn.createdAt!), "PPp")}
                        </span>
                        <div className="flex gap-2">
                          {checkIn.chatId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              onClick={() =>
                                router.push(`/chat?id=${checkIn.chatId}`)
                              }
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                            onClick={() =>
                              checkIn.id && setCheckInToDelete(checkIn.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {checkIn.emotions.map(
                          ({ categoryId, selectedOptions }) => {
                            const category = emotionCategories.find(
                              (c) => c.id === categoryId,
                            );
                            if (!category || !selectedOptions.length)
                              return null;
                            return (
                              <div
                                key={categoryId}
                                className="flex flex-wrap gap-2"
                              >
                                <span className="text-sm font-medium py-1">
                                  {category?.emoji}
                                </span>
                                {selectedOptions.map((optionId) => {
                                  const option = category?.options.find(
                                    (o) => o.id === optionId,
                                  );
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
                          },
                        )}
                        {checkIn.note && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {checkIn.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!checkIns || checkIns.length === 0) && (
                    <p className="text-muted-foreground text-center py-4">
                      No recent check-ins found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emotion Stats */}
            <Card className="flex-1 self-start">
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {emotionCategories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        {category.emoji} {category.label}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {category.options.map((option) => {
                          const count =
                            emotionStats?.[category.id]?.[option.id] || 0;
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
                              <span className="text-sm font-medium">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      <AlertDialog
        open={!!checkInToDelete}
        onOpenChange={() => setCheckInToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Check-in</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this check-in? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
