import { Badge } from "@/components/ui/badge";
import { TURN_TIMER_TICK_MS } from "@/hooks/use-turn-timer";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TurnTimerProps {
  remainingSeconds: number;
  fractionRemaining: number;
  expired: boolean;
}

/** Countdown, with a background bar that drains as the time runs out */
export function TurnTimer({
  remainingSeconds,
  fractionRemaining,
  expired,
}: TurnTimerProps) {
  const percent = Math.min(1, Math.max(0, fractionRemaining)) * 100;
  const runningOut = expired || remainingSeconds <= 30;
  const time = formatTime(remainingSeconds);

  return (
    <Badge
      variant={runningOut ? "destructive" : "outline"}
      role="progressbar"
      aria-label="Time left to choose"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={time}
      className="relative"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0",
          runningOut
            ? "bg-destructive/25 dark:bg-destructive/35"
            : "bg-emerald-500/25 dark:bg-emerald-400/25",
        )}
        style={{
          width: `${percent}%`,
          transition: `width ${TURN_TIMER_TICK_MS}ms linear`,
        }}
      />
      <span className="relative">Time to choose: {time}</span>
    </Badge>
  );
}
