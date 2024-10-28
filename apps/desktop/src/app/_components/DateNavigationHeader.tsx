import { useChatStore } from "@/app/store/chatStore";
import { Button } from "@repo/ui/components/ui/button";
import { addDays, format, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

  const currentDate = new Date(selectedDate || "");

  const handlePreviousDay = () => {
    setSelectedDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(currentDate, 1));
  };

  return (
    <div className="flex items-center p-2 border-b relative h-12">
      <div className="flex-1 flex items-center min-w-[40px]">
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

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2
          className="text-xl font-semibold mx-4 cursor-pointer whitespace-nowrap"
          onClick={() => router.push("/chat")}
        >
          {format(currentDate, "MMMM d")}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-end min-w-[40px]">
        {rightContent}
      </div>
    </div>
  );
}
