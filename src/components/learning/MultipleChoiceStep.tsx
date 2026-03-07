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

      <div className="space-y-2 pt-2">
        {content.options.map((option) => {
          let borderColor = "border-stone-700 hover:border-stone-500";
          let bg = "bg-stone-800 bg-opacity-50";

          if (submitted && option.id === selected) {
            borderColor = option.isCorrect
              ? "border-emerald-500"
              : "border-red-400";
            bg = option.isCorrect
              ? "bg-emerald-900 bg-opacity-30"
              : "bg-red-900 bg-opacity-20";
          } else if (submitted && option.isCorrect) {
            borderColor = "border-emerald-700";
            bg = "bg-emerald-900 bg-opacity-20";
          } else if (!submitted && option.id === selected) {
            borderColor = "border-teal-500";
            bg = "bg-teal-900 bg-opacity-20";
          }

          return (
            <button
              key={option.id}
              onClick={() => !submitted && setSelected(option.id)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded border ${borderColor} ${bg} transition-all ${
                submitted ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span className="text-stone-300">{option.text}</span>
            </button>
          );
        })}
      </div>

      {submitted && selectedOption && (
        <div
          className={`p-4 rounded border ${
            isCorrect
              ? "border-emerald-600 bg-emerald-900 bg-opacity-20"
              : "border-red-500 bg-red-900 bg-opacity-20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`font-semibold ${
                isCorrect ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isCorrect ? "You saw through it." : "It got you. Here's how:"}
            </span>
          </div>
          {selectedOption.explanation && (
            <p className="text-stone-400 text-sm leading-relaxed">
              {selectedOption.explanation}
            </p>
          )}
        </div>
      )}

      <div className="pt-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className={`px-6 py-2.5 font-medium rounded transition-colors ${
              selected === null
                ? "bg-stone-700 text-stone-500 cursor-not-allowed"
                : "bg-teal-700 hover:bg-teal-600 text-stone-100"
            }`}
          >
            Lock In Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-stone-100 font-medium rounded transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
