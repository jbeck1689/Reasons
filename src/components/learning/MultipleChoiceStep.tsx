"use client";

import { useState } from "react";
import { Markdown } from "./Markdown";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface MultipleChoiceStepProps {
  content: {
    prompt: string;
    options: Option[];
  };
  onSubmit: (response: { selectedOptionId: string; isCorrect: boolean }) => void;
  onNext: () => void;
}

export function MultipleChoiceStep({
  content,
  onSubmit,
  onNext,
}: MultipleChoiceStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    const option = content.options.find((o) => o.id === selected);
    if (!option) return;

    setSubmitted(true);
    onSubmit({ selectedOptionId: selected, isCorrect: option.isCorrect });
  };

  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    onNext();
  };

  const selectedOption = content.options.find((o) => o.id === selected);
  const isCorrect = selectedOption?.isCorrect;

  return (
    <div className="space-y-4">
      <Markdown text={content.prompt} />

      <div
        className="space-y-2 pt-2"
        role="radiogroup"
        aria-label="Answer choices"
      >
        {content.options.map((option) => {
          let borderColor = "border-surface-700 hover:border-surface-600";
          let bg = "bg-surface-850";

          if (submitted && option.id === selected) {
            borderColor = option.isCorrect
              ? "border-correct-border"
              : "border-incorrect-border";
            bg = option.isCorrect
              ? "bg-correct-bg"
              : "bg-incorrect-bg";
          } else if (submitted && option.isCorrect) {
            borderColor = "border-correct-border/50";
            bg = "bg-correct-bg";
          } else if (!submitted && option.id === selected) {
            borderColor = "border-accent-500";
            bg = "bg-accent-950/40";
          }

          return (
            <button
              key={option.id}
              onClick={() => !submitted && setSelected(option.id)}
              disabled={submitted}
              role="radio"
              aria-checked={option.id === selected}
              className={`w-full text-left p-4 rounded-lg border ${borderColor} ${bg} transition-all ${
                submitted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className="text-surface-300 font-serif">{option.text}</span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite" aria-atomic="true">
        {submitted && selectedOption && (
          <div
            className={`p-4 rounded-lg border ${
              isCorrect
                ? "border-correct-border bg-correct-bg"
                : "border-incorrect-border bg-incorrect-bg"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`font-semibold ${
                  isCorrect ? "text-correct-text" : "text-incorrect-text"
                }`}
              >
                {isCorrect ? "You saw through it." : "It got you. Here\u2019s how:"}
              </span>
            </div>
            {selectedOption.explanation && (
              <p className="text-surface-400 text-sm leading-relaxed font-serif">
                {selectedOption.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className={`px-6 py-2.5 font-medium rounded-lg transition-all ${
              selected === null
                ? "bg-surface-700 text-surface-500 cursor-not-allowed"
                : "bg-accent-600 hover:bg-accent-500 text-surface-950"
            }`}
          >
            Lock In Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium hover:shadow-lg hover:shadow-accent-600/20 rounded-lg transition-all"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
