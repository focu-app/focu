"use client";

import { useSearchParams } from "next/navigation";

export default function ChatClient() {
  const searchParams = useSearchParams();

  const chatId = searchParams.get("id");

  return (
    <div>
      <h1>Chat</h1>
      <div>{chatId}</div>
    </div>
  );
}
