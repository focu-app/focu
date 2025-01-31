import { useOllamaStore } from "@/app/store";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export function SettingsCard({
  title,
  children,
  onSave,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
}) {
  const { setIsSettingsOpen } = useOllamaStore();

  const handleSave = () => {
    onSave();
    setIsSettingsOpen(false);
  };

  return (
    <Card className="h-full flex flex-col border-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-6">
        {children}
      </CardContent>
      <div className="p-6 flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Card>
  );
}
