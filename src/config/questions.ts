/**
 * In-game question sets.
 *
 * The questions themselves live in `questions.json` next to this file so they
 * can be changed without touching any code. Each top-level key in that file
 * is the name of a question set, which is what the `questions` URL parameter
 * selects (e.g. `?questions=structureagency`). Add a new key to define
 * another set, or edit an existing one to change its wording or when it is
 * asked. `npm run build` type-checks the file against `QuestionSet` below, so
 * a missing or mistyped field fails the build instead of the running client.
 */
import questionSetsJson from "@/config/questions.json";

export interface Question {
  /** The `item` name sent in the Report message for this question, e.g. "structure". */
  item: string;
  /** The statement the user rates. */
  statement: string;
}

export interface QuestionSet {
  /** Short name shown on the Connect page, e.g. "Structure & agency". */
  label: string;
  /** Title of the pop-up. */
  heading: string;
  /** Text under the title of the pop-up (may be empty). */
  description: string;
  /**
   * The answer options, from left to right on each slider. The value
   * reported for an answer is its position in this list, starting at 0, and
   * the option's text is sent as the Report's comment.
   */
  scale: string[];
  /**
   * Position in `scale` every slider starts at the first time the pop-up
   * appears. After that, each slider keeps the user's last answer.
   */
  initialValue: number;
  /** The statements to rate, in the order they are shown. */
  questions: Question[];
  /**
   * Show the pop-up right after the user picks a choice of one of these turn
   * types ("SUCCEED", "FAIL", "PROPOSE", or "PASS"). Empty means never.
   */
  askAfterChoiceTypes: string[];
  /**
   * Minimum time between two pop-ups triggered by `askAfterChoiceTypes`; a
   * qualifying choice made sooner than this after the last pop-up is ignored.
   */
  minSecondsBetweenAsks: number;
  /**
   * Show the pop-up once more when the session stops (the server's Stop
   * message), and only let the client finish once it has been submitted.
   */
  askAtStop: boolean;
}

const questionSets: Record<string, QuestionSet> = questionSetsJson satisfies Record<
  string,
  QuestionSet
>;

/** Names of every question set defined in `questions.json`. */
export const QUESTION_SET_NAMES = Object.keys(questionSets);

/** Looks up a question set by name, or returns null if there is no set with that name. */
export function getQuestionSet(name: string): QuestionSet | null {
  return Object.hasOwn(questionSets, name) ? questionSets[name] : null;
}
