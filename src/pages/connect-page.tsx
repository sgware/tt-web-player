import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ConnectForm } from "@/components/connect/connect-form";
import { ConnectionStatusBanner } from "@/components/connect/connection-status-banner";
import { ParameterSummary, type ParameterSummaryItem } from "@/components/connect/parameter-summary";
import { ServerErrorDialog } from "@/components/connect/server-error-dialog";
import { WaitingPanel } from "@/components/connect/waiting-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getQuestionSet } from "@/config/questions";
import { useTandemTalesSocket } from "@/hooks/use-tandem-tales-socket";
import { PlayPage } from "@/pages/play-page";
import { parseJoinSearchParams } from "@/types/join-params";
import type { TandemTalesRole } from "@/types/protocol";

const ROLE_LABEL: Record<string, string> = {
  "": "Either role",
  PLAYER: "Player",
  GAME_MASTER: "Game Master",
};

type ConnectView = "connect" | "waiting" | "playing";

export function ConnectPage() {
  const [searchParams] = useSearchParams();
  const params = useMemo(() => parseJoinSearchParams(searchParams), [searchParams]);

  const {
    status,
    connectInfo,
    versionMismatch,
    serverError,
    startInfo,
    gameStatus,
    stopInfo,
    endInfo,
    sendJoin,
    sendChoice,
    sendReport,
    sendStop,
    reconnect,
  } = useTandemTalesSocket();

  const [view, setView] = useState<ConnectView>("connect");

  useEffect(() => {
    if (startInfo) setView("playing");
  }, [startInfo]);
  const [password, setPassword] = useState("");
  const [world, setWorld] = useState(params.world.isSet ? params.world.value : "");
  const [role, setRole] = useState<TandemTalesRole | "">(
    params.role.isSet ? params.role.value : "",
  );
  const [partner, setPartner] = useState(params.partner.isSet ? params.partner.value : "");

  const effectiveWorld = params.world.isSet ? params.world.value : world;
  const effectiveRole = params.role.isSet ? params.role.value : role;
  const effectivePartner = params.partner.isSet ? params.partner.value : partner;

  const questionSet = getQuestionSet(params.questions);

  // World, role, and partner set on the URL have no input in the form, so
  // the chosen values are shown here instead, with their descriptions.
  const fixedSettings: ParameterSummaryItem[] = [];
  if (params.world.isSet) {
    const worldInfo = connectInfo?.worlds.find((w) => w.name === effectiveWorld);
    fixedSettings.push({
      label: "Story world",
      displayValue: effectiveWorld ? (worldInfo?.title ?? effectiveWorld) : "Any world",
      description: worldInfo?.description,
    });
  }
  if (params.role.isSet) {
    fixedSettings.push({ label: "Role", displayValue: ROLE_LABEL[effectiveRole] ?? effectiveRole });
  }
  if (params.partner.isSet) {
    const partnerInfo = connectInfo?.agents.find((a) => a.name === effectivePartner);
    fixedSettings.push({
      label: "Partner",
      displayValue: effectivePartner ? (partnerInfo?.title ?? effectivePartner) : "Any partner",
      description: partnerInfo?.description,
    });
  }
  const allSettingsFixed = params.world.isSet && params.role.isSet && params.partner.isSet;

  function handleSubmit() {
    sendJoin({
      name: params.name,
      password: params.passwordRequired ? password : null,
      world: effectiveWorld || null,
      role: effectiveRole || null,
      partner: effectivePartner || null,
    });
    setView("waiting");
  }

  function handleCancel() {
    setView("connect");
    reconnect();
  }

  function handleErrorAcknowledged() {
    setView("connect");
    reconnect();
  }

  if (view === "playing" && startInfo) {
    return (
      <>
        <ServerErrorDialog message={serverError} onAcknowledge={handleErrorAcknowledged} />
        <PlayPage
          startInfo={startInfo}
          gameStatus={gameStatus}
          stopInfo={stopInfo}
          endInfo={endInfo}
          userId={params.user}
          study={params.study}
          questionSet={questionSet}
          sendChoice={sendChoice}
          sendReport={sendReport}
          sendStop={sendStop}
        />
      </>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col justify-center gap-4 px-4 py-10">
      <ServerErrorDialog message={serverError} onAcknowledge={handleErrorAcknowledged} />
      <ThemeToggle className="fixed top-4 right-4" />

      <ConnectionStatusBanner
        status={status}
        versionMismatch={versionMismatch}
        serverVersion={connectInfo?.version}
        onRetry={reconnect}
      />

      <Card>
        <CardHeader>
          <CardTitle>Connect to Tandem Tales</CardTitle>
          {view === "connect" ? (
            allSettingsFixed && (
              <CardDescription>All settings are ready. Review them below, then start playing.</CardDescription>
            )
          ) : (
            <CardDescription>Your join request has been sent.</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          {view === "connect" ? (
            <>
              {fixedSettings.length > 0 && <ParameterSummary items={fixedSettings} />}
              <ConnectForm
                params={params}
                connectInfo={connectInfo}
                ready={status === "open"}
                password={password}
                onPasswordChange={setPassword}
                world={world}
                onWorldChange={setWorld}
                role={role}
                onRoleChange={setRole}
                partner={partner}
                onPartnerChange={setPartner}
                onSubmit={handleSubmit}
              />
            </>
          ) : (
            <WaitingPanel onCancel={handleCancel} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
