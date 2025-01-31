"use client";

import { DateNavigationHeader } from "@/components/DateNavigationHeader";
import { useCheckInStore } from "@/store/checkinStore";
import { db } from "@/database/db";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useLiveQuery } from "dexie-react-hooks";
import { CheckInHistory } from "@/components/check-in/CheckInHistory";
import { DeleteCheckInDialog } from "@/components/check-in/DeleteCheckInDialog";
import { EmotionStats } from "@/components/check-in/EmotionStats";

export default function CheckInClient() {
  const { checkInToDelete, setCheckInToDelete } = useCheckInStore();

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

  return (
    <div className="flex flex-col h-full">
      <DateNavigationHeader />
      <ScrollArea className="flex-1">
        <div className="container mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CheckInHistory checkIns={checkIns || []} />
            <EmotionStats checkIns={checkIns || []} />
          </div>
        </div>
      </ScrollArea>

      <DeleteCheckInDialog
        isOpen={!!checkInToDelete}
        onOpenChange={() => setCheckInToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
