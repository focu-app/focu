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

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]).setHours(0, 0, 0, 0);
    const previousDate = i > 0 ? new Date(sortedDates[i - 1]).setHours(0, 0, 0, 0) : null;

    if (i === 0 || (previousDate !== null && currentDate - previousDate === 86400000)) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    streak = Math.max(streak, currentStreak);
  }

  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1]).setHours(0, 0, 0, 0);
    if (lastDate < today) {
      streak = 0;
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
