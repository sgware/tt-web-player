
import questionSetsJson from "@/config/questions.json";
import type { TandemTalesRole } from "@/types/protocol";


const questionSets: Record<string, QuestionSet> = questionSetsJson satisfies Record<
  string,
  QuestionSet
>;

export const QUESTION_SET_NAMES = Object.keys(questionSets);

export function getQuestionSet(name: string): QuestionSet | null {
  return Object.hasOwn(questionSets, name) ? questionSets[name] : null;
}

export interface QuestionSet {
  askAtStop: boolean;
  label: string;
  heading: string;
  description: string;
  scale: string[];
  initialValue: number;
  questions: Question[];
  askAfterChoiceTypes: Record<TandemTalesRole, string[]>;
  minSecondsBetweenAsks: number;
}

export interface Question {
  item: string;
  statement: string;
}




