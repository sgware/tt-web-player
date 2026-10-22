import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EntityChange } from "@/hooks/use-entity-changes";
import { cn } from "@/lib/utils";
import type { Entity } from "@/types/protocol";

interface SidePanelProps {
  entities: Entity[];
  changes: ReadonlyMap<number, EntityChange>;
  className?: string;
}

/**
 * The Play Page's right side panel
 */
export function SidePanel({ entities, changes, className }: SidePanelProps) {
  return (
    <Card className={cn("h-fit min-h-0", className)}>
      <CardHeader>
        <CardTitle className="text-sm">What you can see</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 space-y-2 overflow-y-auto">
        {entities.map((entity) => {
          const change = changes.get(entity.id);
          return (
            <div
              key={entity.id}
              className={cn(
                "rounded-md border-l-2 border-transparent px-2 py-1.5 transition-[background-color,border-color] duration-500",
                change &&
                  "border-amber-500 bg-amber-500/10 dark:border-amber-400 dark:bg-amber-400/10",
              )}
            >
              <p className="text-sm font-medium">{entity.name}</p>
              <p className="text-muted-foreground text-sm">
                {entity.description}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
