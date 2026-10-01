import { useCallback, useRef, useState } from "react";

import type { QuestionSet } from "@/config/questions";
import type { Turn } from "@/types/protocol";

/** Why the questions pop-up is currently showing. */
export type QuestionsPromptReason = "choice" | "stop";

function initialAnswers(questionSet: QuestionSet | null): number[] {
  if (!questionSet) return [];
  const last = questionSet.scale.length - 1;
  const initial = Math.min(Math.max(Math.round(questionSet.initialValue), 0), last);
  return questionSet.questions.map(() => initial);
}

/**
 * Drives the in-game questions pop-up for one session, per the requirements:
 *  - It appears right after the user picks a choice whose type is listed in
 *    the set's `askAfterChoiceTypes` (PASS, for "structureagency"), but no
 *    more often than once every `minSecondsBetweenAsks`.
 *  - If `askAtStop` is set, it appears once more after the server's Stop
 *    message. That one must be submitted before the client sends its own
 *    Stop, which is what keeps the user here: the server only sends End (and
 *    so the post-survey link) once both clients have sent Stop.
 *  - Answers persist between appearances, so each slider starts where the
 *    user last left it.
 *  - Every Submit sends one Report per question: the answer's position on
 *    the scale as the value, and its text as the comment.
 */
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
    !!questionSet?.askAtStop && stopReceived && !stopPromptSubmitted && !choicePromptOpen;
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
      if (last !== null && now - last < questionSet.minSecondsBetweenAsks * 1000) return;
      lastChoicePromptAtRef.current = now;
      setChoicePromptOpen(true);
    },
    [questionSet],
  );

  const setAnswer = useCallback((questionIndex: number, value: number) => {
    setAnswers((prev) => prev.map((answer, i) => (i === questionIndex ? value : answer)));
  }, []);

  const submit = useCallback(() => {
    if (!questionSet || reason === null) return;
    questionSet.questions.forEach((question, i) => {
      sendReport(question.item, String(answers[i]), questionSet.scale[answers[i]]);
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
