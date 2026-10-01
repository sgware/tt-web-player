import { useEffect, useRef, useState } from "react";

import { ChoiceList } from "@/components/play/choice-list";
import { QuestionsDialog } from "@/components/play/questions-dialog";
import { RoleBanner } from "@/components/play/role-banner";
import { SidePanel } from "@/components/play/side-panel";
import { Transcript } from "@/components/play/transcript";
import { TurnTimer } from "@/components/play/turn-timer";
import { Card, CardContent } from "@/components/ui/card";
import type { QuestionSet } from "@/config/questions";
import { useGameTranscript } from "@/hooks/use-game-transcript";
import { useInGameQuestions } from "@/hooks/use-in-game-questions";
import type { EndMessage, StartMessage, Status, StopMessage, TandemTalesRole, Turn } from "@/types/protocol";

interface PlayPageProps {
  startInfo: StartMessage;
  gameStatus: Status | null;
  stopInfo: StopMessage | null;
  endInfo: EndMessage | null;
  playerId: string | undefined;
  /** The in-game questions to ask (from the `questions` URL parameter), or null for none. */
  questionSet: QuestionSet | null;
  sendChoice: (index: number) => void;
  sendReport: (item: string, value: string, comment: string) => void;
  sendStop: (role: TandemTalesRole) => void;
}

export function PlayPage({
  startInfo,
  gameStatus,
  stopInfo,
  endInfo,
  playerId,
  questionSet,
  sendChoice,
  sendReport,
  sendStop,
}: PlayPageProps) {
  const { lines, endingReached } = useGameTranscript(gameStatus);
  const questions = useInGameQuestions(questionSet, stopInfo !== null, sendReport);
  const [pendingChoice, setPendingChoice] = useState<Turn | null>(null);
  const stopAckSentRef = useRef(false);

  useEffect(() => {
    setPendingChoice(null);
  }, [gameStatus]);

  const role = gameStatus?.role ?? startInfo.role;

  useEffect(() => {
    if (stopInfo && questions.readyToStop && !stopAckSentRef.current) {
      stopAckSentRef.current = true;
      sendStop(role);
    }
  }, [stopInfo, questions.readyToStop, role, sendStop]);

  const choices = stopInfo ? [] : (gameStatus?.choices ?? []);
  const lastHistoryTurn = gameStatus?.history[gameStatus.history.length - 1];
  const entities = gameStatus?.descriptions ?? [];

  function handleChoose(index: number) {
    const turn = choices[index];
    if (!turn) return;
    setPendingChoice(turn);
    sendChoice(index);
    questions.promptAfterChoice(turn);
  }

  const endLink = endInfo
    ? {
        href: `post.php?${new URLSearchParams({
          ...(playerId ? { id: playerId } : {}),
          session: endInfo.session,
        }).toString()}`,
        label: "The story has ended. Click here!",
      }
    : null;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-4 px-4 py-8">
      {questionSet && (
        <QuestionsDialog
          key={questions.reason === "stop" ? "stop" : "choice"}
          questionSet={questionSet}
          open={questions.reason !== null}
          answers={questions.answers}
          onAnswerChange={questions.setAnswer}
          onSubmit={questions.submit}
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <RoleBanner role={role} />
        <TurnTimer active={choices.length > 0 && !pendingChoice} resetKey={gameStatus} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="space-y-4">
            <Transcript
              lines={lines}
              pendingChoiceText={pendingChoice ? `You chose: ${pendingChoice.description}` : null}
              stopMessage={stopInfo && !endingReached ? stopInfo.message : null}
              endLink={endLink}
            />
            {choices.length > 0 && !pendingChoice && (
              <ChoiceList choices={choices} lastHistoryTurn={lastHistoryTurn} onChoose={handleChoose} />
            )}
          </CardContent>
        </Card>

        <SidePanel entities={entities} />
      </div>
    </div>
  );
}
