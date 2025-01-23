"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/db";
import { DateNavigationHeader } from "@/app/_components/DateNavigationHeader";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { useCheckInStore } from "@/app/store/checkinStore";
import { CheckInHistory } from "./_components/CheckInHistory";
import { EmotionStats } from "./_components/EmotionStats";
import { DeleteCheckInDialog } from "./_components/DeleteCheckInDialog";

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
