import { Button } from "@repo/ui/components/ui/button";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChatStore } from "@/app/store/chatStore";

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

  const currentDate = new Date(selectedDate || "");

  const handlePreviousDay = () => {
    setSelectedDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(currentDate, 1));
  };

  return (
    <div className="flex justify-between items-center p-4 border-b">
      {showSidebarToggle && (
        <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
          {isSidebarVisible ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      )}
      <div className="flex items-center justify-center flex-1">
        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold mx-4">
          {format(currentDate, "MMMM d")}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {rightContent}
    </div>
  );
}
