"use client";

import { Markdown } from "./Markdown";

interface InstructionStepProps {
  content: { body: string };
  onNext: () => void;
}

export function InstructionStep({ content, onNext }: InstructionStepProps) {
  return (
    <div className="space-y-1">
      <Markdown text={content.body} />
      <div className="pt-6">
        <button
          onClick={onNext}
          className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-stone-100 font-medium rounded transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
