import type { Entity, Turn } from "@/types/protocol";

/** At or below this many choices, everything is shown flat -- e.g. accepting or refusing a proposal. */
const FLAT_THRESHOLD = 3;

/** Above this many choices for one character, they are split further by action type. */
const ACTION_TYPE_THRESHOLD = 3;

export interface ChoiceItem {
  /** Index into the original `choices` array -- what the Choice message must send. */
  index: number;
  turn: Turn;
}

/** A single choice button, or a labeled, expandable group of further nodes. */
export type ChoiceNode =
  | { kind: "choice"; key: string; item: ChoiceItem }
  | {
      kind: "group";
      key: string;
      label: string;
      count: number;
      children: ChoiceNode[];
    };

/** The longest common leading run of whole words shared by every description. */
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

/** How the story refers to a character (e.g. "the guard"), falling back to its internal name. */
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

  return [...buckets].map(([actionType, bucket]) => {
    const key = `${groupKey}/action:${actionType}`;
    return bucket.length === 1
      ? choiceNode(groupKey, bucket[0])
      : {
          kind: "group",
          key,
          label: actionTypeLabel(bucket),
          count: bucket.length,
          children: bucket.map((item) => choiceNode(key, item)),
        };
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

  for (const item of items) {
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

  return gameMasterPassFirst(nodes);
}
