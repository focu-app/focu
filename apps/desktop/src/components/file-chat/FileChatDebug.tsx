"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import * as fileChatManager from "@/database/file-chat-manager";
import { useFileChatStore } from "@/store/fileChatStore";

export function FileChatDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { initialize, loadChats, createChat } = useFileChatStore();

  const runDiagnostics = async () => {
    try {
      // Initialize if needed
      await initialize();

      // Get all chats
      const allChats = await fileChatManager.getChatsForDay("");

      // Get today's chats
      const today = new Date().toISOString().split("T")[0];
      const todayChats = await fileChatManager.getChatsForDay(today);

      // Update debug info
      setDebugInfo({
        allChatsCount: allChats.length,
        todayChatsCount: todayChats.length,
        allChats,
        todayChats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Diagnostics error:", error);
      setDebugInfo({ error: String(error) });
    }
  };

  const createTestChat = async () => {
    try {
      const newChat = await createChat();
      runDiagnostics();
      return newChat;
    } catch (error) {
      console.error("Error creating test chat:", error);
      setDebugInfo({ error: String(error) });
    }
  };

  const clearAllChats = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL file chats? This cannot be undone!",
      )
    ) {
      return;
    }

    try {
      const allChats = await fileChatManager.getChatsForDay("");

      for (const chat of allChats) {
        await fileChatManager.deleteChat(chat.id);
      }

      runDiagnostics();
      alert("All chats deleted successfully!");
    } catch (error) {
      console.error("Error clearing all chats:", error);
      setDebugInfo({ error: String(error) });
    }
  };

  // Run diagnostics on mount
  useEffect(() => {
    runDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="border rounded p-4 mt-4 bg-muted/20">
      <h3 className="font-medium mb-2">File Chat Debug</h3>
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={runDiagnostics}>
          Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={createTestChat}>
          Create Test Chat
        </Button>
        <Button variant="outline" size="sm" onClick={clearAllChats}>
          Clear All Chats
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        All Chats: {debugInfo.allChatsCount || 0} | Today's Chats:{" "}
        {debugInfo.todayChatsCount || 0} | Last Check: {debugInfo.timestamp}
      </div>

      {debugInfo.error && (
        <div className="text-red-500 text-xs mt-2">
          Error: {debugInfo.error}
        </div>
      )}

      {debugInfo.allChatsCount > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">Recent Chats:</h4>
          <ul className="text-xs space-y-1">
            {debugInfo.allChats?.slice(0, 5).map((chat: any) => (
              <li key={chat.id}>
                ID: {chat.id.slice(0, 8)}... | Date: {chat.dateString} | Title:{" "}
                {chat.title || "Untitled"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
