"use client";

import { useState } from "react";
import { Markdown } from "./Markdown";

interface FreeResponseStepProps {
  content: {
    prompt: string;
    sampleAnswer?: string;
  };
  onSubmit: (response: { text: string }) => void;
  onNext: () => void;
}

export function FreeResponseStep({
  content,
  onSubmit,
  onNext,
}: FreeResponseStepProps) {
  const [response, setResponse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (response.trim().length === 0) return;
    setSubmitted(true);
    onSubmit({ text: response.trim() });
  };

  const handleNext = () => {
    setResponse("");
    setSubmitted(false);
    onNext();
  };

  return (
    <div className="space-y-4">
      <Markdown text={content.prompt} />

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        disabled={submitted}
        placeholder="Write your response here..."
        aria-label="Your response"
        className="w-full h-36 p-4 bg-surface-800 border border-surface-700 rounded-lg text-surface-200 font-serif placeholder-surface-500 focus:border-accent-500 focus:outline-none resize-y"
      />

      <div aria-live="polite" aria-atomic="true">
        {submitted && content.sampleAnswer && (
          <div className="p-4 rounded-lg border border-surface-600/50 bg-surface-850">
            <p className="text-sm font-semibold text-accent-400 mb-2">Debrief:</p>
            <p className="text-surface-400 text-sm leading-relaxed font-serif">
              {content.sampleAnswer}
            </p>
          </div>
        )}
      </div>

      <div className="pt-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={response.trim().length === 0}
            className={`px-6 py-2.5 font-medium rounded-lg transition-all ${
              response.trim().length === 0
                ? "bg-surface-700 text-surface-500 cursor-not-allowed"
                : "bg-accent-600 hover:bg-accent-500 text-surface-950"
            }`}
          >
            Submit
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
