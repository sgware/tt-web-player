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
