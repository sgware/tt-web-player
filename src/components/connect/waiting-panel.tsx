import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WaitingPanelProps {
  onCancel: () => void;
}

/** The Waiting Page: shown after the Join message has been sent, while the client waits for a partner. */
export function WaitingPanel({ onCancel }: WaitingPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <Loader2 className="text-muted-foreground size-8 animate-spin" />
      <p className="text-sm font-medium">Waiting for a partner to join&hellip;</p>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
