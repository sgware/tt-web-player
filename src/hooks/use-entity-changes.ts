import { useCallback, useEffect, useMemo, useState } from "react";

import type { Entity } from "@/types/protocol";

export type EntityChange = "new" | "changed";

function snapshot(entities: Entity[]): ReadonlyMap<number, string> {
  return new Map(entities.map((entity) => [entity.id, entity.description]));
}

/**
 * Tracks which side-panel entities have appeared or changed since the user
 * last took their turn. The baseline is the first set of entities shown, and
 * moves to whatever is visible each time `acknowledge()` is called -- i.e.
 * when the user makes a choice -- so everything that happens afterwards (the
 * result of that choice and everything the partner does) stays highlighted
 * until the user's next choice.
 */
export function useEntityChanges(entities: Entity[] | null) {
  const [baseline, setBaseline] = useState<ReadonlyMap<number, string> | null>(null);

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

  const acknowledge = useCallback(() => {
    if (entities) setBaseline(snapshot(entities));
  }, [entities]);

  return { changes, acknowledge };
}
