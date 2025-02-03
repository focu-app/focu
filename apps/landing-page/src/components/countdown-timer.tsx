"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: Date;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <div className="flex justify-center gap-4 mt-4">
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.days}</span>
        <span className="text-sm ml-1">days</span>
      </div>
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.hours}</span>
        <span className="text-sm ml-1">hrs</span>
      </div>
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.minutes}</span>
        <span className="text-sm ml-1">min</span>
      </div>
      <div className="text-white">
        <span className="text-2xl font-bold">{timeLeft.seconds}</span>
        <span className="text-sm ml-1">sec</span>
      </div>
    </div>
  );
}
