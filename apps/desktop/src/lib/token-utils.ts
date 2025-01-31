import type { CoreMessage } from "ai";
import { encodeChat } from "gpt-tokenizer";

export interface TokenizedMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

export function calculateTokenCount(messages: CoreMessage[]): number {
  const tokenizedMessages = messages
    .filter((msg) => msg.role !== "tool")
    .map((msg) => ({
      role: msg.role as "assistant" | "user" | "system",
      content:
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content),
    }));

  return encodeChat(tokenizedMessages, "gpt-4-turbo").length;
}
