import { useEffect, useMemo, useState } from "react";

import type { Entity } from "@/types/protocol";

export type EntityChange = "new" | "changed";

function snapshot(entities: Entity[]): ReadonlyMap<number, string> {
  return new Map(entities.map((entity) => [entity.id, entity.description]));
}

/**
 * Tracks which side-panel entities have appeared or changed since the turn
 * last passed from the user to their partner. The baseline is the first set
 * of entities shown, and moves to whatever is visible each time `myTurn`
 * goes from true to false -- i.e. once the user's turn is over, results
 * included -- so everything the partner does afterwards (and anything the
 * user does on their next turn) stays highlighted until the turn passes
 * again.
 */
export function useEntityChanges(entities: Entity[] | null, myTurn: boolean) {
  const [baseline, setBaseline] = useState<ReadonlyMap<number, string> | null>(null);
  const [wasMyTurn, setWasMyTurn] = useState(myTurn);

  // Adjusted while rendering rather than in an effect, so the old highlights
  // never flash for a frame once the turn has passed.
  if (myTurn !== wasMyTurn) {
    setWasMyTurn(myTurn);
    if (!myTurn && entities) setBaseline(snapshot(entities));
  }

  useEffect(() => {
    if (entities && baseline === null) setBaseline(snapshot(entities));
  }, [entities, baseline]);

  const changes = useMemo(() => {
    const result = new Map<number, EntityChange>();
    if (!entities || !baseline) return result;
    for (const entity of entities) {
      const before = baseline.get(entity.id);
      if (before === undefined) result.set(entity.id, "new");
      else if (before !== entity.description) result.set(entity.id, "changed");
    }
    return result;
  }, [entities, baseline]);

  return changes;
}
