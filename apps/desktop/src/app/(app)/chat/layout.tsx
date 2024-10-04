"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getChatsForDay } from "@/database/chats";
import type { Chat, ChatType } from "@/database/db";
import { Button } from "@repo/ui/components/ui/button";
import { useChatStore } from "@/app/store/chatStore";
import { useOllamaStore } from "@/app/store";
import Link from "next/link";

export default function ChatLayout({
  children,
}: { children: React.ReactNode }) {
  const { addChat } = useChatStore();
  const { activeModel } = useOllamaStore();
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  const chats = useLiveQuery(async () => {
    return getChatsForDay(new Date());
  }, []);

  const handleAddChat = () => {
    const chat = {
      type: "general" as ChatType,
      date: new Date().setHours(0, 0, 0, 0),
      model: activeModel ?? "",
    };
    addChat(chat);
  };

  return (
    <div>
      {chats?.map((chat) => (
        <Link key={chat.id} href={`/chat?id=${chat.id}`}>
          {chat.id} - {chat.type}
        </Link>
      ))}
      <div>
        <Button onClick={handleAddChat}>New Chat</Button>
      </div>
      <div>{children}</div>
    </div>
  );
}
