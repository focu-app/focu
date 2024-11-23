import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/database/db";

export default function useStatsCounter() {
  const chats = useLiveQuery(() => db.chats.where("type").equals("morning").toArray());
  const messages = useLiveQuery(() => db.messages.toArray());

  const uniqueDates = [...new Set(chats?.map((chat) => chat.date))];

  const words = messages
    ?.filter((message) => message.role === "user")
    .reduce((acc, message) => acc + message.text.split(" ").length, 0);

  return {
    streak: uniqueDates.length,
    chats: chats?.length,
    words,
  };
}
