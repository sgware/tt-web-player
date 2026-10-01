import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { groupChoices } from "@/lib/choice-grouping";
import type { Turn } from "@/types/protocol";
import { cn } from "@/lib/utils";

interface ChoiceListProps {
  choices: Turn[];
  /** The last turn already in history, if any -- determines the prompt wording. */
  lastHistoryTurn: Turn | undefined;
  onChoose: (index: number) => void;
}

function promptText(lastHistoryTurn: Turn | undefined): string {
  if (lastHistoryTurn?.type === "PROPOSE") {
    return `Your partner proposed: ${lastHistoryTurn.description} How do you respond?`;
  }
  return "It is your turn. What do you do?";
}

/**
 * The Play Page's interactive choice prompt. Choices are shown as clickable
 * options; once there are too many to read comfortably, similar ones (same
 * action signature) collapse into an expandable group.
 */
export function ChoiceList({ choices, lastHistoryTurn, onChoose }: ChoiceListProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const groups = groupChoices(choices);

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{promptText(lastHistoryTurn)}</p>
      <div className="flex flex-col gap-1">
        {groups.map((group) => {
          if (group.label === null) {
            const { index, turn } = group.items[0];
            return (
              <Button
                key={group.key}
                variant="outline"
                className="h-auto justify-start px-3 py-2 text-left whitespace-normal"
                onClick={() => onChoose(index)}
              >
                {turn.description}
              </Button>
            );
          }

          const isOpen = expanded.has(group.key);
          return (
            <div key={group.key}>
              <Button
                variant="outline"
                aria-expanded={isOpen}
                className="h-auto w-full justify-start px-3 py-2 text-left whitespace-normal"
                onClick={() => toggleGroup(group.key)}
              >
                <ChevronRight className={cn("size-4 transition-transform", isOpen && "rotate-90")} />
                {group.label}
              </Button>
              {isOpen && (
                <div className="mt-1 ml-4 flex flex-col gap-1 border-l pl-3">
                  {group.items.map(({ index, turn }) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto justify-start px-3 py-2 text-left whitespace-normal"
                      onClick={() => onChoose(index)}
                    >
                      {turn.description}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
