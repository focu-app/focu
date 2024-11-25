import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/db";

export default function useStatsCounter() {
  const chats = useLiveQuery(() => db.chats.toArray());
  const messages = useLiveQuery(() => db.messages.toArray());
  const checkIns = useLiveQuery(() => db.checkIns.toArray());

  const uniqueDates = [...new Set(chats?.map((chat) => chat.date))];

  const sortedDates = uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let streak = 0;
  let currentStreak = 0;
  const today = new Date().setHours(0, 0, 0, 0);

  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1]).setHours(0, 0, 0, 0);

    if (today - lastDate <= 86400000) {
      currentStreak = 1;

      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const currentDate = new Date(sortedDates[i]).setHours(0, 0, 0, 0);
        const nextDate = new Date(sortedDates[i + 1]).setHours(0, 0, 0, 0);

        if (nextDate - currentDate === 86400000) {
          currentStreak++;
        } else {
          break;
        }
      }

      streak = currentStreak;
    }
  }

  const words = messages
    ?.filter((message) => message.role === "user")
    .reduce((acc, message) => acc + message.text.split(" ").length, 0);

  return {
    streak,
    chats: chats?.length,
    words,
    checkIns: checkIns?.length,
  };
}
