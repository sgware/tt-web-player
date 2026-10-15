import { useEffect, useState } from "react";

/** How often the countdown re-renders; the top bar eases between ticks. */
export const TURN_TIMER_TICK_MS = 250;

export function useTurnTimer(
  active: boolean,
  totalSeconds: number,
  resetKey: unknown,
) {
  const totalMs = totalSeconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);

  useEffect(() => {
    if (!active) return;
    setRemainingMs(totalMs);

    const startedAt = Date.now();
    const interval = setInterval(() => {
      setRemainingMs(Math.max(0, totalMs - (Date.now() - startedAt)));
    }, TURN_TIMER_TICK_MS);

    return () => clearInterval(interval);
  }, [active, resetKey, totalMs]);

  return {
    remainingSeconds: Math.ceil(remainingMs / 1000),
    fractionRemaining: totalMs > 0 ? remainingMs / totalMs : 0,
    expired: active && remainingMs <= 0,
  };
}
