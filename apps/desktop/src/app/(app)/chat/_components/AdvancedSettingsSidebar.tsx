import { useChatStore } from "@/app/store/chatStore";
import { getChat, getChatMessages, updateMessage } from "@/database/chats";
import { ModelSelector } from "@/app/_components/ModelSelector";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "@repo/ui/hooks/use-toast";
import { useLiveQuery } from "dexie-react-hooks";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AdvancedSettingsSidebar() {
  const { isAdvancedSidebarVisible, toggleAdvancedSidebar } = useChatStore();
  const [systemMessage, setSystemMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  const chat = useLiveQuery(async () => {
    if (!chatId) return null;
    return getChat(Number(chatId));
  }, [chatId]);

  const messages = useLiveQuery(async () => {
    if (!chatId) return [];
    return getChatMessages(Number(chatId));
  }, [chatId]);

  const systemMsg = messages?.find((m) => m.role === "system");

  useEffect(() => {
    if (chatId) {
      setIsEditing(false);
    }
    if (isAdvancedSidebarVisible && !chatId) {
      toggleAdvancedSidebar();
    }
  }, [chatId, isAdvancedSidebarVisible, toggleAdvancedSidebar]);

  useEffect(() => {
    if (systemMsg && !isEditing) {
      setSystemMessage(systemMsg.text);
    }
  }, [systemMsg, isEditing]);

  const handleSystemMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setSystemMessage(e.target.value);
    setIsEditing(true);
  };

  const handleUpdateSystemMessage = async () => {
    if (chatId && systemMsg) {
      await updateMessage(systemMsg.id!, { text: systemMessage });
      setIsEditing(false);
      toast({
        title: "System message updated",
        description: "Your system message has been updated",
      });
    }
  };

  if (!isAdvancedSidebarVisible) return null;

  return (
    <div className="w-80 h-full border-l flex flex-col">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-lg font-semibold">Advanced Settings</h2>
        <Button variant="ghost" size="icon" onClick={toggleAdvancedSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          <ModelSelector
            chatId={chatId ? Number(chatId) : undefined}
            disabled={!chatId}
          />
          <div>
            <Label htmlFor="system-message">System Message</Label>
            <Textarea
              id="system-message"
              value={systemMessage}
              onChange={handleSystemMessageChange}
              rows={10}
            />
            <Button
              className="mt-2"
              onClick={handleUpdateSystemMessage}
              disabled={!chatId || !systemMsg || !isEditing}
            >
              Update System Message
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
