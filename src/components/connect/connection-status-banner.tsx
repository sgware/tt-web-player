import { AlertTriangle, Loader2, WifiOff } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TT_SERVER_VERSION } from "@/config/settings";
import type { SocketStatus } from "@/hooks/use-tandem-tales-socket";

interface ConnectionStatusBannerProps {
  status: SocketStatus;
  versionMismatch: boolean;
  serverVersion?: string;
  onRetry: () => void;
}

/**
 * Reusable banner that surfaces the connection lifecycle to the Tandem Tales
 * server: connecting, connection lost, or a version mismatch warning
 * (displayed at the top of the page, per the requirements).
 */
export function ConnectionStatusBanner({
  status,
  versionMismatch,
  serverVersion,
  onRetry,
}: ConnectionStatusBannerProps) {
  if (status === "connecting") {
    return (
      <Alert>
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Connecting to the Tandem Tales server&hellip;</AlertTitle>
      </Alert>
    );
  }

  if (status === "error" || status === "closed") {
    return (
      <Alert variant="destructive">
        <WifiOff className="size-4" />
        <AlertTitle>Couldn&apos;t reach the Tandem Tales server</AlertTitle>
        <AlertDescription>
          Check that the server is running and reachable, then try again.
        </AlertDescription>
        <Button size="sm" variant="outline" onClick={onRetry} className="col-start-2 mt-2 w-fit">
          Retry connection
        </Button>
      </Alert>
    );
  }

  if (versionMismatch) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="size-4" />
        <AlertTitle>Server version mismatch</AlertTitle>
        <AlertDescription>
          This client expects server version {TT_SERVER_VERSION}, but the server reported
          version {serverVersion ?? "unknown"}. The client will still try to run.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
