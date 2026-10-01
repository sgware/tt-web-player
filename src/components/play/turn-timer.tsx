import { Badge } from "@/components/ui/badge";
import { CHOICE_TIME_SECONDS } from "@/config/settings";
import { useTurnTimer } from "@/hooks/use-turn-timer";

interface TurnTimerProps {
  active: boolean;
  resetKey: unknown;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Countdown shown only while it's this client's turn to choose. */
export function TurnTimer({ active, resetKey }: TurnTimerProps) {
  const { remainingSeconds, expired } = useTurnTimer(active, CHOICE_TIME_SECONDS, resetKey);

  if (!active) return null;

  return (
    <Badge variant={expired || remainingSeconds <= 30 ? "destructive" : "outline"}>
      Time to choose: {formatTime(remainingSeconds)}
    </Badge>
  );
}
