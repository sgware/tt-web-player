import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Entity } from "@/types/protocol";

interface SidePanelProps {
  entities: Entity[];
}

/** The Play Page's right side panel: every entity currently visible to this client. */
export function SidePanel({ entities }: SidePanelProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-sm">What you can see</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing visible yet.</p>
        ) : (
          entities.map((entity, i) => (
            <div key={entity.id}>
              {i > 0 && <Separator className="mb-3" />}
              <p className="text-sm font-medium">{entity.name}</p>
              <p className="text-muted-foreground text-sm">{entity.description}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
