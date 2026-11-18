import type { Entity, Turn } from "@/types/protocol";


const FLAT_THRESHOLD = 3;
const ACTION_TYPE_THRESHOLD = 3;
const MIN_GROUP_SIZE = 3;
export const FAILED_GROUP_KEY = "failed";
const FAILED_GROUP_LABEL = "A character tries but fails to do something";

export interface ChoiceItem {
  index: number;
  turn: Turn;
}


export type ChoiceNode =
  | { kind: "choice"; key: string; item: ChoiceItem }
  | {
      kind: "group";
      key: string;
      label: string;
      count: number;
      children: ChoiceNode[];
    };


function commonWordPrefix(descriptions: string[]): string {
  const wordLists = descriptions.map((d) => d.split(/\s+/));
  const shortest = Math.min(...wordLists.map((w) => w.length));
  const prefix: string[] = [];
  for (let i = 0; i < shortest; i++) {
    const word = wordLists[0][i];
    if (wordLists.every((words) => words[i] === word)) {
      prefix.push(word);
    } else {
      break;
    }
  }
  return prefix.join(" ");
}

function capitalize(word: string): string {
  return word.length === 0 ? word : word[0].toUpperCase() + word.slice(1);
}


function characterLabel(entity: Entity): string {
  return capitalize(entity.description || entity.name);
}

function actionTypeLabel(bucket: ChoiceItem[]): string {
  const first = bucket[0].turn;

  if (
    first.action &&
    bucket.every((item) => item.turn.action?.id === first.action?.id)
  ) {
    return `${capitalize(first.action.description.replace(/\.$/, ""))}…`;
  }

  const prefix = commonWordPrefix(bucket.map((item) => item.turn.description));
  if (prefix.split(" ").filter(Boolean).length >= 3) {
    return `${prefix}…`;
  }
  return capitalize(first.action?.signature.name ?? first.type.toLowerCase());
}

function choiceNode(parentKey: string, item: ChoiceItem): ChoiceNode {
  return { kind: "choice", key: `${parentKey}/${item.index}`, item };
}

function bucketBy(items: ChoiceItem[], keyOf: (item: ChoiceItem) => string) {
  const buckets = new Map<string, ChoiceItem[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }
  return buckets;
}

/** One character's choices, split by action type once there are more than a few of them. */
function characterChildren(
  groupKey: string,
  items: ChoiceItem[],
): ChoiceNode[] {
  if (items.length <= ACTION_TYPE_THRESHOLD) {
    return items.map((item) => choiceNode(groupKey, item));
  }

  const buckets = bucketBy(
    items,
    (item) => item.turn.action?.signature.name ?? item.turn.type,
  );
  if (buckets.size === 1) {
    return items.map((item) => choiceNode(groupKey, item));
  }

  return [...buckets].flatMap(([actionType, bucket]): ChoiceNode[] => {
    if (bucket.length < MIN_GROUP_SIZE) {
      return bucket.map((item) => choiceNode(groupKey, item));
    }
    const key = `${groupKey}/action:${actionType}`;
    return [
      {
        kind: "group",
        key,
        label: actionTypeLabel(bucket),
        count: bucket.length,
        children: bucket.map((item) => choiceNode(key, item)),
      },
    ];
  });
}

function isSmallGroup(node: ChoiceNode): boolean {
  return node.kind === "group" && node.count < MIN_GROUP_SIZE;
}

function addShownIndices(node: ChoiceNode, shown: Set<number>) {
  if (node.kind === "choice") shown.add(node.item.index);
  else node.children.forEach((child) => addShownIndices(child, shown));
}

function inlineSmallGroups(nodes: ChoiceNode[]): ChoiceNode[] {
  const shown = new Set<number>();
  nodes
    .filter((node) => !isSmallGroup(node))
    .forEach((node) => addShownIndices(node, shown));

  return nodes.flatMap((node) => {
    if (node.kind === "choice" || !isSmallGroup(node)) return [node];
    return node.children.filter((child) => {
      if (child.kind === "group") return true;
      if (shown.has(child.item.index)) return false;
      shown.add(child.item.index);
      return true;
    });
  });
}

function isGameMasterPass(node: ChoiceNode): boolean {
  return (
    node.kind === "choice" &&
    node.item.turn.role === "GAME_MASTER" &&
    node.item.turn.type === "PASS"
  );
}

/** The game master's pass -- letting the player act -- always leads the list. */
function gameMasterPassFirst(nodes: ChoiceNode[]): ChoiceNode[] {
  return [
    ...nodes.filter(isGameMasterPass),
    ...nodes.filter((node) => !isGameMasterPass(node)),
  ];
}

export function groupChoices(choices: Turn[]): ChoiceNode[] {
  const items: ChoiceItem[] = choices.map((turn, index) => ({ index, turn }));

  if (items.length <= FLAT_THRESHOLD) {
    return gameMasterPassFirst(items.map((item) => choiceNode("flat", item)));
  }

  const characters = new Map<number, { entity: Entity; items: ChoiceItem[] }>();
  const unconsented: ChoiceItem[] = [];
  const noAction: ChoiceItem[] = [];
  const failed: ChoiceItem[] = [];

  for (const item of items) {
    if (item.turn.type === "FAIL") {
      failed.push(item);
      continue;
    }
    const action = item.turn.action;
    if (!action) {
      noAction.push(item);
      continue;
    }
    if (action.consenting.length === 0) {
      unconsented.push(item);
      continue;
    }
    const seen = new Set<number>();
    for (const entity of action.consenting) {
      if (seen.has(entity.id)) continue;
      seen.add(entity.id);
      const group = characters.get(entity.id);
      if (group) group.items.push(item);
      else characters.set(entity.id, { entity, items: [item] });
    }
  }

  const nodes: ChoiceNode[] = [...characters.values()].map(
    ({ entity, items: own }) => {
      const key = `character:${entity.id}`;
      return {
        kind: "group",
        key,
        label: characterLabel(entity),
        count: own.length,
        children: characterChildren(key, own),
      };
    },
  );

  if (unconsented.length > 0) {
    const key = "other";
    nodes.push({
      kind: "group",
      key,
      label: "Other actions",
      count: unconsented.length,
      children: characterChildren(key, unconsented),
    });
  }

  for (const item of noAction) {
    nodes.push(choiceNode("loose", item));
  }

  if (failed.length > 0) {
    nodes.push({
      kind: "group",
      key: FAILED_GROUP_KEY,
      label: FAILED_GROUP_LABEL,
      count: failed.length,
      children: characterChildren(FAILED_GROUP_KEY, failed),
    });
  }

  return gameMasterPassFirst(inlineSmallGroups(nodes));
}
