import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/db";

export default function useStatsCounter() {
  const chats = useLiveQuery(() => db.chats.toArray());
  const messages = useLiveQuery(() => db.messages.toArray());
  const checkIns = useLiveQuery(() => db.checkIns.toArray());

  const uniqueDates = [...new Set(chats?.map((chat) => chat.date))];

  const sortedDates = uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  console.log("Unique Dates:", uniqueDates); // Debugging: Check unique dates
  console.log("Sorted Dates:", sortedDates); // Debugging: Check sorted dates

  let streak = 0;
  let currentStreak = 0;
  const today = new Date().setHours(0, 0, 0, 0); // Normalize today's date

  console.log("Sorted Dates:", sortedDates); // Debugging: Check sorted dates

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]).setHours(0, 0, 0, 0); // Normalize current date
    const previousDate = i > 0 ? new Date(sortedDates[i - 1]).setHours(0, 0, 0, 0) : null;

    console.log(`Current Date: ${currentDate}, Previous Date: ${previousDate}`); // Debugging: Check date comparison

    if (i === 0 || (previousDate !== null && currentDate - previousDate === 86400000)) {
      console.log("Incrementing streak");
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    streak = Math.max(streak, currentStreak);
  }

  // Check if the last date is today
  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1]).setHours(0, 0, 0, 0);
    console.log(`Last Date: ${lastDate}, Today: ${today}`); // Debugging: Check last date vs today
    if (lastDate < today) {
      streak = 0; // Reset streak if today is not included
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
