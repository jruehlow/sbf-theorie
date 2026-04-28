import React from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";

interface AnswerOptionProps {
  text: string;
  reveal: boolean;
  selected: boolean;
  correct: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const AnswerOption: React.FC<AnswerOptionProps> = ({
  text,
  reveal,
  selected,
  correct,
  disabled = false,
  onSelect,
}) => {
  const isCorrectAnswer = reveal && correct;
  const isWrongSelection = reveal && selected && !correct;
  const muted = reveal && !correct && !selected;

  const stateClass = isCorrectAnswer
    ? "border-emerald-500 bg-emerald-50 text-emerald-950"
    : isWrongSelection
      ? "border-red-500 bg-red-50 text-red-950"
      : muted
        ? "border-slate-200 bg-slate-50 text-slate-500"
        : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={[
        "flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm transition sm:text-base",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:cursor-default",
        stateClass,
      ].join(" ")}
    >
      <span>{text}</span>
      {isCorrectAnswer && (
        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-emerald-700">
          <FaCheck className="h-4 w-4" />
          Richtig
        </span>
      )}
      {isWrongSelection && (
        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-red-700">
          <FaXmark className="h-4 w-4" />
          Deine Antwort
        </span>
      )}
    </button>
  );
};

export default AnswerOption;
