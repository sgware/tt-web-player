import type { TranscriptLine } from "@/hooks/use-game-transcript";

interface TranscriptProps {
  lines: TranscriptLine[];
  /** An ephemeral "you chose: ..." line shown immediately after a choice, before the server confirms it. */
  pendingChoiceText: string | null;
  /** The server's explanation when the session stopped abnormally (partner left, server shutdown, etc.). */
  stopMessage: string | null;
  /** Rendered as the final, clickable line once the server sends End. */
  endLink: { href: string; label: string } | null;
}

export function Transcript({ lines, pendingChoiceText, stopMessage, endLink }: TranscriptProps) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {lines.map((line) => (
        <p key={line.id}>{line.text}</p>
      ))}
      {pendingChoiceText && <p className="text-muted-foreground italic">{pendingChoiceText}</p>}
      {stopMessage && <p>{stopMessage}</p>}
      {endLink && (
        <p>
          <a href={endLink.href} className="text-primary font-medium underline underline-offset-4">
            {endLink.label}
          </a>
        </p>
      )}
    </div>
  );
}
