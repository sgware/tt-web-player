import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Entity } from "@/types/protocol";

interface SidePanelProps {
  entities: Entity[];
  className?: string;
}

export function SidePanel({ entities, className }: SidePanelProps) {
  return (
    <Card className={cn("h-fit min-h-0", className)}>
      <CardHeader>
        <CardTitle className="text-sm">What you can see</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 space-y-3 overflow-y-auto">
        {entities.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing visible yet.</p>
        ) : (
          entities.map((entity, i) => (
            <div key={entity.id}>
              {i > 0 && <Separator className="mb-3" />}
              <p className="text-sm font-medium">{entity.name}</p>
              <p className="text-muted-foreground text-sm">
                {entity.description}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
