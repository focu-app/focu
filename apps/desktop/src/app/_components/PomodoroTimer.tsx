"use client";

import PomodoroCore from "./PomodoroCore";

export const PomodoroTimer = () => {
  return (
    <div className="p-4 flex flex-col gap-4 justify-between">
      <div className="flex flex-col flex-end gap-8 border rounded-md p-4">
        <PomodoroCore />
      </div>
    </div>
  );
};

export default PomodoroTimer;
