import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type ChoiceNode, groupChoices } from "@/lib/choice-grouping";
import type { Turn } from "@/types/protocol";
import { cn } from "@/lib/utils";

interface ChoiceListProps {
  choices: Turn[];
  lastHistoryTurn: Turn | undefined;
  onChoose: (index: number) => void;
}

function promptText(lastHistoryTurn: Turn | undefined): string {
  if (lastHistoryTurn?.type === "PROPOSE") {
    return `Your partner proposed: ${lastHistoryTurn.description} How do you respond?`;
  }
  return "It is your turn. What do you do?";
}

interface ChoiceNodesProps {
  nodes: ChoiceNode[];
  expanded: Set<string>;
  onToggle: (key: string) => void;
  onChoose: (index: number) => void;
  nested: boolean;
}

function ChoiceNodes({
  nodes,
  expanded,
  onToggle,
  onChoose,
  nested,
}: ChoiceNodesProps) {
  return nodes.map((node) => {
    if (node.kind === "choice") {
      return (
        <Button
          key={node.key}
          variant={nested ? "ghost" : "outline"}
          className="h-auto w-full justify-start px-3 py-2 text-left whitespace-normal"
          onClick={() => onChoose(node.item.index)}
        >
          {node.item.turn.description}
        </Button>
      );
    }

    const isOpen = expanded.has(node.key);
    return (
      <div key={node.key}>
        <Button
          variant={nested ? "ghost" : "outline"}
          aria-expanded={isOpen}
          className="h-auto w-full justify-start px-3 py-2 text-left whitespace-normal"
          onClick={() => onToggle(node.key)}
        >
          <ChevronRight
            className={cn("size-4 transition-transform", isOpen && "rotate-90")}
          />
          <span className="flex-1">{node.label}</span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {node.count}
          </span>
        </Button>
        {isOpen && (
          <div className="mt-1 ml-4 flex flex-col gap-1 border-l pl-3">
            <ChoiceNodes
              nodes={node.children}
              expanded={expanded}
              onToggle={onToggle}
              onChoose={onChoose}
              nested
            />
          </div>
        )}
      </div>
    );
  });
}

/**
 * The Play Page's interactive choice prompt. Choices are grouped by the
 * character who would take them, then by action type (see
 * `groupChoices`), as expandable groups. A lone group starts open, since
 * there is nothing else to pick between.
 */
export function ChoiceList({
  choices,
  lastHistoryTurn,
  onChoose,
}: ChoiceListProps) {
  const nodes = groupChoices(choices);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const groups = nodes.filter((node) => node.kind === "group");
    return new Set(groups.length === 1 ? [groups[0].key] : []);
  });

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
        <ChoiceNodes
          nodes={nodes}
          expanded={expanded}
          onToggle={toggleGroup}
          onChoose={onChoose}
          nested={false}
        />
      </div>
    </div>
  );
}
