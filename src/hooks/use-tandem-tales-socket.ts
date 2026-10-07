import { useCallback, useEffect, useRef, useState } from "react";

import { getTandemTalesSocketUrl, TT_SERVER_VERSION } from "@/config/settings";
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
  /** Set once the server sends the Start message; marks the transition to the play page. */
  startInfo: StartMessage | null;
  /** The most recent Update message's status payload. */
  gameStatus: Status | null;
  /** Set once the server sends a Stop message (story ended, partner left, or server shutdown). */
  stopInfo: StopMessage | null;
  /** Set once the server sends the End message; the session is fully over. */
  endInfo: EndMessage | null;
  sendJoin: (message: Omit<JoinMessage, "type">) => void;
  sendChoice: (index: number) => void;
  sendReport: (item: string, value: string, comment: string) => void;
  /** Sends the client's own Stop message, acknowledging the server's Stop. */
  sendStop: (role: TandemTalesRole) => void;
  reconnect: () => void;
}

/** The server may send each message as a text or binary WebSocket frame; normalize both to text. */
async function readMessageText(
  data: string | Blob | ArrayBuffer,
): Promise<string> {
  if (typeof data === "string") return data;
  if (data instanceof Blob) return data.text();
  return new TextDecoder().decode(data);
}

/**
 * The server prefixes each visible entity's description with how the story
 * refers to it (e.g. "the barista: The barista is in the shop."); keep only
 * the text after the first ":".
 */
function stripDescriptionLabel(description: string): string {
  const separator = description.indexOf(":");
  return separator >= 0
    ? description.slice(separator + 1).trimStart()
    : description;
}

/**
 * Owns the WebSocket connection to the Tandem Tales server for the entire
 * lifetime of a session: connecting, joining, playing, and stopping. A
 * single socket is threaded through every phase because the server
 * correlates all of it to one connection -- there's no session token to
 * reconnect with later.
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
  // The server's protocol is newline-delimited even over WebSocket -- a
  // single logical message can arrive split across multiple WebSocket
  // message events (a large Start payload reliably splits at an 8KB
  // boundary through this server's relay), so incoming bytes have to be
  // buffered and only parsed once a full line has accumulated.
  const recvBufferRef = useRef("");
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
    recvBufferRef.current = "";

    const socket = new WebSocket(getTandemTalesSocketUrl());
    socketRef.current = socket;

    // In development, StrictMode mounts this effect, tears it down, and
    // mounts it again, which can abort this exact socket before it ever
    // opens. Its close/error events may still arrive later, asynchronously,
    // after a newer socket has taken over -- so every handler below ignores
    // events from a socket that is no longer the current one.
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
          setGameStatus({
            ...parsed.status,
            descriptions: parsed.status.descriptions.map((entity) => ({
              ...entity,
              description: stripDescriptionLabel(entity.description),
            })),
          });
          break;
        case "Stop":
          setStopInfo(parsed);
          break;
        case "End":
          setEndInfo(parsed);
          break;
      }
    };

    socket.onmessage = (event: MessageEvent<string | Blob | ArrayBuffer>) => {
      void (async () => {
        let chunk: string;
        try {
          chunk = await readMessageText(event.data);
        } catch {
          return;
        }
        if (!isCurrent()) return;

        recvBufferRef.current += chunk;
        let newlineIndex: number;
        while ((newlineIndex = recvBufferRef.current.indexOf("\n")) >= 0) {
          const line = recvBufferRef.current.slice(0, newlineIndex);
          recvBufferRef.current = recvBufferRef.current.slice(newlineIndex + 1);
          if (!line.trim()) continue;

          let parsed: unknown;
          try {
            parsed = JSON.parse(line);
          } catch {
            continue;
          }
          handleServerMessage(parsed);
        }
      })();
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [attempt]);

  // The server only accepts binary WebSocket frames (it rejects text frames
  // with close code 1003), so every outgoing JSON payload is sent as bytes.
  // The protocol is also newline-delimited even over WebSocket -- the
  // server's line-oriented reader on the other side of the relay won't
  // process a message until it sees the trailing "\n", so omitting it
  // leaves the message stuck unprocessed until the connection closes.
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
