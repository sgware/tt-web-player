import { useCallback, useEffect, useRef, useState } from "react";

import { getTandemTalesSocketUrl, TT_SERVER_VERSION } from "@/config/settings";
import { createLineReader } from "@/lib/line-reader";
import type {
  ChoiceMessage,
  ConnectMessage,
  EndMessage,
  JoinMessage,
  ReportMessage,
  StartMessage,
  Status,
  StopMessage,
  TandemTalesRole,
} from "@/types/protocol";
import { isServerMessage } from "@/types/protocol";

export type SocketStatus = "connecting" | "open" | "closed" | "error";

export interface TandemTalesSocketState {
  status: SocketStatus;
  connectInfo: ConnectMessage | null;
  versionMismatch: boolean;
  serverError: string | null;
  startInfo: StartMessage | null;
  gameStatus: Status | null;
  stopInfo: StopMessage | null;
  endInfo: EndMessage | null;
  sendJoin: (message: Omit<JoinMessage, "type">) => void;
  sendChoice: (index: number) => void;
  sendReport: (item: string, value: string, comment: string) => void;
  sendStop: (role: TandemTalesRole) => void;
  reconnect: () => void;
}

/**
 * Owns the WebSocket connection to the Tandem Tales server for the entire
 */
export function useTandemTalesSocket(): TandemTalesSocketState {
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const [connectInfo, setConnectInfo] = useState<ConnectMessage | null>(null);
  const [versionMismatch, setVersionMismatch] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [startInfo, setStartInfo] = useState<StartMessage | null>(null);
  const [gameStatus, setGameStatus] = useState<Status | null>(null);
  const [stopInfo, setStopInfo] = useState<StopMessage | null>(null);
  const [endInfo, setEndInfo] = useState<EndMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus("connecting");
    setConnectInfo(null);
    setVersionMismatch(false);
    setServerError(null);
    setStartInfo(null);
    setGameStatus(null);
    setStopInfo(null);
    setEndInfo(null);

    const socket = new WebSocket(getTandemTalesSocketUrl());
    socketRef.current = socket;

    const isCurrent = () => socketRef.current === socket;

    socket.onopen = () => {
      if (isCurrent()) setStatus("open");
    };
    socket.onclose = () => {
      if (isCurrent())
        setStatus((prev) => (prev === "error" ? prev : "closed"));
    };
    socket.onerror = () => {
      if (isCurrent()) setStatus("error");
    };

    const handleServerMessage = (parsed: unknown) => {
      if (!isServerMessage(parsed) || !isCurrent()) return;

      console.warn(parsed);

      switch (parsed.type) {
        case "Connect":
          setConnectInfo(parsed);
          setVersionMismatch(parsed.version !== TT_SERVER_VERSION);
          break;
        case "Error":
          setServerError(parsed.message);
          break;
        case "Start":
          setStartInfo(parsed);
          break;
        case "Update":
          setGameStatus(parsed.status);
          break;
        case "Stop":
          setStopInfo(parsed);
          break;
        case "End":
          setEndInfo(parsed);
          break;
      }
    };

    socket.binaryType = "arraybuffer";
    const feed = createLineReader((line) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(line);
      } catch (error) {
        console.error(
          `Dropped unparseable server message (${line.length} chars)`,
          error,
        );
        return;
      }
      handleServerMessage(parsed);
    });

    socket.onmessage = (event: MessageEvent<string | ArrayBuffer>) => {
      if (isCurrent()) feed(event.data);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [attempt]);

  const sendBinary = useCallback((payload: unknown) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(new TextEncoder().encode(JSON.stringify(payload) + "\n"));
  }, []);

  const sendJoin = useCallback(
    (message: Omit<JoinMessage, "type">) =>
      sendBinary({ type: "Join", ...message }),
    [sendBinary],
  );

  const sendChoice = useCallback(
    (index: number) =>
      sendBinary({ type: "Choice", index } satisfies ChoiceMessage),
    [sendBinary],
  );

  const sendReport = useCallback(
    (item: string, value: string, comment: string) =>
      sendBinary({
        type: "Report",
        item,
        value,
        comment,
      } satisfies ReportMessage),
    [sendBinary],
  );

  const sendStop = useCallback(
    (role: TandemTalesRole) =>
      sendBinary({ type: "Stop", role, message: "Client acknowledging stop." }),
    [sendBinary],
  );

  const reconnect = useCallback(() => setAttempt((n) => n + 1), []);

  return {
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
  };
}
