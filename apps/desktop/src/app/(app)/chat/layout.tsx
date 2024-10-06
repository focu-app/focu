import { Sidebar } from "./_components/Sidebar";

export default function ChatLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
