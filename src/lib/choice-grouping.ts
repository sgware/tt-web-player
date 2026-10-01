import type { Turn } from "@/types/protocol";

/** Above this many choices, similar ones are grouped into an expandable sub-list. */
const GROUP_THRESHOLD = 6;

export interface ChoiceItem {
  /** Index into the original `choices` array -- what the Choice message must send. */
  index: number;
  turn: Turn;
}

export interface ChoiceGroup {
  key: string;
  /** Present only when this group has more than one item and needs a disclosure label. */
  label: string | null;
  items: ChoiceItem[];
}

function bucketKey(turn: Turn): string {
  return turn.action ? `action:${turn.action.signature.name}` : `turn:${turn.type}`;
}

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

function groupLabel(bucket: ChoiceItem[]): string {
  const first = bucket[0].turn;

  // When every item is a different outcome (SUCCEED/FAIL/...) of the exact
  // same action, the descriptions only ever share a short, generic prefix
  // (e.g. "The player…") -- the action's own neutral description reads
  // much better as a label in that case.
  if (first.action && bucket.every((item) => item.turn.action?.id === first.action?.id)) {
    return `${first.action.description.replace(/\.$/, "")}…`;
  }

  const prefix = commonWordPrefix(bucket.map((item) => item.turn.description));
  if (prefix.split(" ").filter(Boolean).length >= 2) {
    return `${prefix}…`;
  }
  const name = first.action?.signature.name ?? first.type;
  return `${capitalize(name)} options…`;
}

/**
 * Groups choices that share a common action signature (e.g. every "walk"
 * action) once there are too many to show flat, so a long list of similar
 * choices collapses into a labeled, expandable sub-list. Below the
 * threshold, every choice is returned as its own singleton group.
 */
export function groupChoices(choices: Turn[]): ChoiceGroup[] {
  const items: ChoiceItem[] = choices.map((turn, index) => ({ index, turn }));

  if (items.length <= GROUP_THRESHOLD) {
    return items.map((item) => ({ key: `single:${item.index}`, label: null, items: [item] }));
  }

  const buckets = new Map<string, ChoiceItem[]>();
  for (const item of items) {
    const key = bucketKey(item.turn);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }

  const groups: ChoiceGroup[] = [];
  for (const [key, bucket] of buckets) {
    if (bucket.length === 1) {
      groups.push({ key, label: null, items: bucket });
    } else {
      groups.push({ key, label: groupLabel(bucket), items: bucket });
    }
  }
  return groups;
}
