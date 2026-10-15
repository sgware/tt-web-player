import type { Entity } from "@/types/protocol";

export function relevantEntities(
  descriptions: Entity[],
  worldEntities: Entity[],
): Entity[] {
  const original = new Map(
    worldEntities.map((entity) => [entity.id, entity.description]),
  );

  return descriptions.filter((entity) => {
    const description = entity.description.trim();
    if (description === "") return false;

    const base = original.get(entity.id);
    if (base === undefined) return true;
    const placeholder =
      `this is ${base.trim().replace(/\.$/, "")}`.toLowerCase();
    return description.replace(/\.$/, "").toLowerCase() !== placeholder;
  });
}
