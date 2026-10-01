import { useEffect, useRef, useState } from "react";

import type { Status } from "@/types/protocol";

export interface TranscriptLine {
  id: string;
  text: string;
}

function rolePhrase(role: Status["role"]): string {
  return role === "PLAYER"
    ? "You are the player. Please wait for the game master to go first."
    : "You are the game master. You go first.";
}

/**
 * Builds the play page's main text transcript incrementally from the stream
 * of Update messages, per the requirements:
 *  - The first Update contributes the initial state description and a
 *    role-based phrase.
 *  - Each later Update appends one line based on the *last* turn in the
 *    history: the current state's description if it SUCCEEDed, or that
 *    turn's own description if it FAILed. PROPOSE/PASS turns don't append a
 *    permanent line on their own -- they only shape the choice prompt.
 *  - Once the story's ending becomes non-null, its description is appended
 *    exactly once.
 *
 * Only the latest `state.description` is ever available (older snapshots
 * aren't retained by the protocol), so this has to be accumulated as
 * Updates arrive rather than recomputed from a static history array.
 */
export function useGameTranscript(gameStatus: Status | null) {
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [endingReached, setEndingReached] = useState(false);
  const initializedRef = useRef(false);
  const prevHistoryLengthRef = useRef(0);
  const endingShownRef = useRef(false);
  const nextIdRef = useRef(0);

  useEffect(() => {
    if (!gameStatus) return;

    const newLines: TranscriptLine[] = [];
    const pushLine = (text: string) => {
      newLines.push({ id: `line-${nextIdRef.current++}`, text });
    };

    if (!initializedRef.current) {
      pushLine(gameStatus.state.description);
      pushLine(rolePhrase(gameStatus.role));
      initializedRef.current = true;
      prevHistoryLengthRef.current = gameStatus.history.length;
    } else if (gameStatus.history.length > prevHistoryLengthRef.current) {
      const lastTurn = gameStatus.history[gameStatus.history.length - 1];
      if (lastTurn.type === "SUCCEED") {
        pushLine(gameStatus.state.description);
      } else if (lastTurn.type === "FAIL") {
        pushLine(lastTurn.description);
      }
      prevHistoryLengthRef.current = gameStatus.history.length;
    }

    if (gameStatus.ending && !endingShownRef.current) {
      pushLine(gameStatus.ending.description);
      endingShownRef.current = true;
      setEndingReached(true);
    }

    if (newLines.length > 0) {
      setLines((prev) => [...prev, ...newLines]);
    }
  }, [gameStatus]);

  return { lines, endingReached };
}
