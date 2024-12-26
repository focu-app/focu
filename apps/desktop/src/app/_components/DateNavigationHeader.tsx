import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { addDays, format, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTransitionRouter as useRouter } from "next-view-transitions";

interface DateNavigationHeaderProps {
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
  rightContent?: React.ReactNode;
}

export function DateNavigationHeader({
  showSidebarToggle = false,
  onSidebarToggle,
  rightContent,
}: DateNavigationHeaderProps) {
  const { selectedDate, setSelectedDate, isSidebarVisible } = useChatStore();
  const router = useRouter();

  const currentDate = new Date(
    `${selectedDate || new Date().toISOString().split("T")[0]}T00:00:00`,
  );

  const handlePreviousDay = () => {
    const newDate = subDays(currentDate, 1);
    const dateString = format(newDate, "yyyy-MM-dd");
    setSelectedDate(dateString);
  };

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    const dateString = format(newDate, "yyyy-MM-dd");
    setSelectedDate(dateString);
  };

  return (
    <div
      className="flex items-center p-2 relative h-12 z-50 border-b"
      data-tauri-drag-region
    >
      <div
        className="flex-1 flex items-center min-w-[40px]"
        data-tauri-drag-region
      >
        {showSidebarToggle && (
          <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
            {isSidebarVisible ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center z-20"
        data-tauri-drag-region
      >
        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2
          className="text-xl font-semibold p-1 px-2 text-pretty hover:bg-primary/10 hover:text-accent-foreground rounded-sm hover:cursor-default whitespace-nowrap"
          onClick={() => router.push("/chat")}
        >
          {format(currentDate, "MMMM d")}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="flex-1 flex items-center justify-end min-w-[40px]"
        data-tauri-drag-region
      >
        {rightContent}
      </div>
    </div>
  );
}
