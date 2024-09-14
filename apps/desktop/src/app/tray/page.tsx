import PomodoroTimer from "../PomodoroTimer";

const Tray = () => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-transparent">
      <PomodoroTimer />
    </div>
  );
};

export default Tray;
