import { useEffect, useLayoutEffect, useRef } from "react";

import type { TranscriptLine } from "@/hooks/use-game-transcript";
import { cn } from "@/lib/utils";

const STICK_THRESHOLD_PX = 8;

interface TranscriptProps {
  lines: TranscriptLine[];
  pendingChoiceText: string | null;
  stopMessage: string | null;
  endLink: { href: string; label: string } | null;
  className?: string;
}

export function Transcript({
  lines,
  pendingChoiceText,
  stopMessage,
  endLink,
  className,
}: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(true);
  const endHref = endLink?.href;

  // New text always scrolls into view.
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
    followingRef.current = true;
  }, [lines, pendingChoiceText, stopMessage, endHref]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      followingRef.current =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <=
        STICK_THRESHOLD_PX;
    };
    const observer = new ResizeObserver(() => {
      if (followingRef.current) scroller.scrollTop = scroller.scrollHeight;
    });

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={scrollRef} className={cn("overflow-y-auto", className)}>
      <div className="space-y-3 text-sm leading-relaxed">
        {lines.map((line) => (
          <p key={line.id}>{line.text}</p>
        ))}
        {pendingChoiceText && (
          <p className="text-muted-foreground italic">{pendingChoiceText}</p>
        )}
        {stopMessage && <p>{stopMessage}</p>}
        {endLink && (
          <p>
            <a
              href={endLink.href}
              className="text-primary font-medium underline underline-offset-4"
            >
              {endLink.label}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
