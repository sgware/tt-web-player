import { useId } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import type { QuestionSet } from "@/config/questions";
import { cn } from "@/lib/utils";

/** Width of the slider thumb in px (`size-3`); Radix keeps it inside the track. */
const THUMB_SIZE = 12;

interface ScaleQuestionProps {
  statement: string;
  scale: string[];
  value: number;
  onChange: (value: number) => void;
}

/** One statement rated on a horizontal slider, with a clickable label under each step. */
function ScaleQuestion({ statement, scale, value, onChange }: ScaleQuestionProps) {
  const statementId = useId();
  // Inset the slider so each of its steps sits over the centre of the
  // matching label column below. Radix keeps the thumb inside the track, so
  // the thumb's centre at either end is half a thumb in from the track's edge.
  const inset = `calc(${50 / scale.length}% - ${THUMB_SIZE / 2}px)`;

  return (
    <div className="space-y-3">
      <p id={statementId} className="text-sm font-medium">
        {statement}
      </p>
      <div style={{ paddingInline: inset }}>
        <Slider
          min={0}
          max={scale.length - 1}
          step={1}
          value={[value]}
          onValueChange={([next]) => onChange(next)}
          thumbProps={{ "aria-labelledby": statementId, "aria-valuetext": scale[value] }}
        />
      </div>
      <div
        className="grid text-center text-xs"
        style={{ gridTemplateColumns: `repeat(${scale.length}, minmax(0, 1fr))` }}
      >
        {scale.map((label, i) => (
          // The slider itself is the keyboard-accessible control, so these
          // are mouse/touch shortcuts only and stay out of the tab order.
          <button
            key={label}
            type="button"
            tabIndex={-1}
            onClick={() => onChange(i)}
            className={cn(
              "text-muted-foreground hover:text-foreground px-1 leading-tight",
              i === value && "text-foreground font-medium",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface QuestionsDialogProps {
  questionSet: QuestionSet;
  open: boolean;
  answers: number[];
  onAnswerChange: (questionIndex: number, value: number) => void;
  onSubmit: () => void;
}

/**
 * The in-game questions pop-up. It can only be dismissed with Submit:
 * clicking outside it or pressing Escape does nothing.
 */
export function QuestionsDialog({
  questionSet,
  open,
  answers,
  onAnswerChange,
  onSubmit,
}: QuestionsDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-lg"
        onEscapeKeyDown={(event) => event.preventDefault()}
        {...(questionSet.description ? {} : { "aria-describedby": undefined })}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{questionSet.heading}</AlertDialogTitle>
          {questionSet.description && (
            <AlertDialogDescription>{questionSet.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="space-y-6 py-2">
          {questionSet.questions.map((question, i) => (
            <ScaleQuestion
              key={question.item}
              statement={question.statement}
              scale={questionSet.scale}
              value={answers[i]}
              onChange={(value) => onAnswerChange(i, value)}
            />
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogAction onClick={onSubmit}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
