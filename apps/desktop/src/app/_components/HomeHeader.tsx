import useStatsCounter from "@/app/hooks/useStatsCounter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="w-[125px]">
      <CardHeader className="p-2">
        <CardTitle className="font-medium text-md text-center">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <p className="text-pretty text-center font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function HomeHeader() {
  const { streak, chats, words, checkIns } = useStatsCounter();

  return (
    <div className="flex flex-row gap-2 items-center">
      <StatCard label="Streak" value={streak ? streak : "—"} />
      <StatCard label="Chats" value={chats ? chats : "—"} />
      <StatCard label="Check-ins" value={checkIns ? checkIns : "—"} />
      <StatCard label="Words" value={words ? words : "—"} />
    </div>
  );
}
