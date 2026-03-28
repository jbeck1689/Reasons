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
          className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium hover:shadow-lg hover:shadow-accent-600/20 rounded-lg transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
