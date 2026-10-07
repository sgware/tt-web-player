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
  study: string | undefined;
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
  study,
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
        href: `/after.php?${new URLSearchParams({
          ...(playerId ? { id: playerId } : {}),
          ...(study ? { study } : {}),
          session: endInfo.session,
        }).toString()}`,
        label: "The story has ended. Click here!",
      }
    : null;

  return (
    <div className="mx-auto flex h-svh w-full max-w-5xl flex-col gap-4 px-4 py-4 md:py-8">
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
      <div className="flex shrink-0 items-center justify-between gap-2">
        <RoleBanner role={role} />
        <TurnTimer active={choices.length > 0 && !pendingChoice} resetKey={gameStatus} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-4 md:grid-cols-3 md:grid-rows-1">
        <Card className="min-h-0 md:col-span-2">
          <Transcript
            className="min-h-0 flex-1 px-(--card-spacing)"
            lines={lines}
            pendingChoiceText={pendingChoice ? `You chose: ${pendingChoice.description}` : null}
            stopMessage={stopInfo && !endingReached ? stopInfo.message : null}
            endLink={endLink}
          />
          {choices.length > 0 && !pendingChoice && (
            <CardContent className="max-h-[45%] shrink-0 overflow-y-auto border-t pt-4">
              <ChoiceList choices={choices} lastHistoryTurn={lastHistoryTurn} onChoose={handleChoose} />
            </CardContent>
          )}
        </Card>

        <SidePanel entities={entities} className="max-h-[30svh] md:max-h-full" />
      </div>
    </div>
  );
}
