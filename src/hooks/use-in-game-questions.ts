import { useCallback, useEffect, useRef, useState } from "react";

import type { QuestionSet } from "@/config/questions";
import type { Status, TandemTalesRole, Turn } from "@/types/protocol";

/** Why the questions pop-up is currently showing. */
export type QuestionsPromptReason = "choice" | "stop";

function initialAnswers(questionSet: QuestionSet | null): number[] {
  if (!questionSet) return [];
  const last = questionSet.scale.length - 1;
  const initial = Math.min(
    Math.max(Math.round(questionSet.initialValue), 0),
    last,
  );
  return questionSet.questions.map(() => initial);
}

function shouldAskAfter(role: TandemTalesRole, history: Turn[]): boolean {
  const previous = history.at(-1);
  const beforePrevious = history.at(-2);
  if (previous?.type !== "SUCCEED" && previous?.type !== "FAIL") return false;
  if (role === "GAME_MASTER") return true;
  return (
    previous.role === "GAME_MASTER" &&
    beforePrevious?.role === "PLAYER" &&
    beforePrevious.type === "PROPOSE"
  );
}

export function useInGameQuestions(
  questionSet: QuestionSet | null,
  gameStatus: Status | null,
  stopReceived: boolean,
  sendReport: (item: string, value: string, comment: string) => void,
) {
  const [answers, setAnswers] = useState(() => initialAnswers(questionSet));
  const [choicePromptOpen, setChoicePromptOpen] = useState(false);
  const [stopPromptRequested, setStopPromptRequested] = useState(false);
  const [stopPromptSubmitted, setStopPromptSubmitted] = useState(false);
  const lastChoicePromptAtRef = useRef<number | null>(null);
  const prevHistoryLengthRef = useRef(0);

  useEffect(() => {
    if (!gameStatus) return;
    const newTurn = gameStatus.history.length > prevHistoryLengthRef.current;
    prevHistoryLengthRef.current = gameStatus.history.length;
    if (
      !questionSet ||
      !newTurn ||
      gameStatus.ending ||
      !shouldAskAfter(gameStatus.role, gameStatus.history)
    )
      return;
    const now = Date.now();
    const last = lastChoicePromptAtRef.current;
    if (last !== null && now - last < questionSet.minSecondsBetweenAsks * 1000)
      return;
    lastChoicePromptAtRef.current = now;
    setChoicePromptOpen(true);
  }, [questionSet, gameStatus]);

  const stopQuestionsPending =
    !!questionSet?.askAtStop && stopReceived && !stopPromptSubmitted;
  const stopPromptOpen =
    stopQuestionsPending && stopPromptRequested && !choicePromptOpen;
  const reason: QuestionsPromptReason | null = choicePromptOpen
    ? "choice"
    : stopPromptOpen
      ? "stop"
      : null;

  const openStopPrompt = useCallback(() => setStopPromptRequested(true), []);

  const setAnswer = useCallback((questionIndex: number, value: number) => {
    setAnswers((prev) =>
      prev.map((answer, i) => (i === questionIndex ? value : answer)),
    );
  }, []);

  const submit = useCallback(() => {
    if (!questionSet || reason === null) return;
    questionSet.questions.forEach((question, i) => {
      sendReport(
        question.item,
        String(answers[i]),
        questionSet.scale[answers[i]],
      );
    });
    if (reason === "choice") setChoicePromptOpen(false);
    else setStopPromptSubmitted(true);
  }, [questionSet, reason, answers, sendReport]);

  return {
    reason,
    answers,
    setAnswer,
    submit,
    stopQuestionsPending,
    openStopPrompt,
    readyToStop: stopReceived && !choicePromptOpen && !stopQuestionsPending,
  };
}
