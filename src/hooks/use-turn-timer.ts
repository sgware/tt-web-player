import { useEffect, useState } from "react";

/**
 * A countdown timer for the play page's "time to choose" indicator. Restarts
 * from `totalSeconds` whenever `resetKey` changes while `active` is true, and
 * stops (without resetting the displayed value) as soon as `active` goes
 * false -- e.g. because the user made a choice.
 */
export function useTurnTimer(active: boolean, totalSeconds: number, resetKey: unknown) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  useEffect(() => {
    if (!active) return;
    setRemainingSeconds(totalSeconds);

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemainingSeconds(Math.max(0, totalSeconds - elapsed));
    }, 250);

    return () => clearInterval(interval);
    // `resetKey` (e.g. the latest Update) is a dep purely to restart the countdown when it changes.
  }, [active, resetKey, totalSeconds]);

  return { remainingSeconds, expired: active && remainingSeconds <= 0 };
}
