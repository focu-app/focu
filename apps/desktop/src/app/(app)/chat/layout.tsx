import { ChatSidebar } from "./_components/ChatSidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <ChatSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
