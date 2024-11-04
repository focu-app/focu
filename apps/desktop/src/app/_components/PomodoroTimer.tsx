"use client";

import { Card, CardContent } from "@repo/ui/components/ui/card";
import PomodoroCore from "./PomodoroCore";

export const PomodoroTimer = () => {
  return (
    <Card>
      <CardContent>
        <PomodoroCore />
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
