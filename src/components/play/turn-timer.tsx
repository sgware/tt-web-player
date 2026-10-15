import { Badge } from "@/components/ui/badge";
import { TIMER_BAR_COLOR, TIMER_BAR_HEIGHT_PX } from "@/config/settings";
import { TURN_TIMER_TICK_MS } from "@/hooks/use-turn-timer";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TurnTimerProps {
  remainingSeconds: number;
  expired: boolean;
}

/** Countdown */
export function TurnTimer({ remainingSeconds, expired }: TurnTimerProps) {
  return (
    <Badge
      variant={expired || remainingSeconds <= 30 ? "destructive" : "outline"}
    >
      Time to choose: {formatTime(remainingSeconds)}
    </Badge>
  );
}

interface TurnTimerBarProps {
  fractionRemaining: number;
}

export function TurnTimerBar({ fractionRemaining }: TurnTimerBarProps) {
  const percent = Math.min(1, Math.max(0, fractionRemaining)) * 100;

  return (
    <div
      role="progressbar"
      aria-label="Time left to choose"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      style={{ height: TIMER_BAR_HEIGHT_PX }}
    >
      <div
        className="h-full"
        style={{
          width: `${percent}%`,
          backgroundColor: TIMER_BAR_COLOR,
          boxShadow: `0 0 8px ${TIMER_BAR_COLOR}`,
          transition: `width ${TURN_TIMER_TICK_MS}ms linear`,
        }}
      />
    </div>
  );
}
