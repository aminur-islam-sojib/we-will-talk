"use client";
import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const milliseconds = Math.floor(diff % 1000);

  return { days, hours, minutes, seconds, milliseconds };
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const display = value.toString().padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex aspect-square w-16 items-center justify-center rounded-xl bg-card shadow-sm sm:w-20 md:w-24">
        <span className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl md:text-4xl">
          {display}
        </span>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function MillisecondUnit({ value }: { value: number }) {
  const display = value.toString().padStart(3, "0");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex aspect-square w-16 items-center justify-center rounded-xl bg-card shadow-sm sm:w-20 md:w-24">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-primary sm:text-3xl md:text-4xl">
          {display}
        </span>
      </div>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs">
        ms
      </span>
    </div>
  );
}

function Countdown() {
  const targetDate = new Date("2027-06-27T00:00:00");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetDate));
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-4 md:gap-5">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
      <MillisecondUnit value={timeLeft.milliseconds} />
    </div>
  );
}

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex flex-col items-center gap-10 sm:gap-14">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          We Will Talk
        </h1>
        <Countdown />
        <p className="text-center text-sm text-muted-foreground sm:text-base">
          Counting down to June 27, 2027
        </p>
      </div>
    </div>
  );
}
