import { useCallback, useRef, useState } from "react";

import type { QuestionSet } from "@/config/questions";
import type { Turn } from "@/types/protocol";

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

export function useInGameQuestions(
  questionSet: QuestionSet | null,
  stopReceived: boolean,
  sendReport: (item: string, value: string, comment: string) => void,
) {
  const [answers, setAnswers] = useState(() => initialAnswers(questionSet));
  const [choicePromptOpen, setChoicePromptOpen] = useState(false);
  const [stopPromptSubmitted, setStopPromptSubmitted] = useState(false);
  const lastChoicePromptAtRef = useRef<number | null>(null);

  // If the session stops while a choice-triggered pop-up is still open, the
  // end-of-session one follows as soon as that one is submitted.
  const stopPromptOpen =
    !!questionSet?.askAtStop &&
    stopReceived &&
    !stopPromptSubmitted &&
    !choicePromptOpen;
  const reason: QuestionsPromptReason | null = choicePromptOpen
    ? "choice"
    : stopPromptOpen
      ? "stop"
      : null;

  const promptAfterChoice = useCallback(
    (turn: Turn) => {
      if (!questionSet?.askAfterChoiceTypes.includes(turn.type)) return;
      const now = Date.now();
      const last = lastChoicePromptAtRef.current;
      if (
        last !== null &&
        now - last < questionSet.minSecondsBetweenAsks * 1000
      )
        return;
      lastChoicePromptAtRef.current = now;
      setChoicePromptOpen(true);
    },
    [questionSet],
  );

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
    promptAfterChoice,
    /** True once the server has sent Stop and no questions remain, so the client may send its own Stop. */
    readyToStop: stopReceived && reason === null,
  };
}
