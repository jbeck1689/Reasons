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
        className="w-full h-36 p-4 bg-stone-800 border border-stone-700 rounded text-stone-300 placeholder-stone-600 focus:border-teal-600 focus:outline-none resize-y"
      />

      {submitted && content.sampleAnswer && (
        <div className="p-4 rounded border border-stone-600 bg-stone-800 bg-opacity-50">
          <p className="text-sm font-medium text-teal-400 mb-2">Debrief:</p>
          <p className="text-stone-400 text-sm leading-relaxed">
            {content.sampleAnswer}
          </p>
        </div>
      )}

      <div className="pt-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={response.trim().length === 0}
            className={`px-6 py-2.5 font-medium rounded transition-colors ${
              response.trim().length === 0
                ? "bg-stone-700 text-stone-500 cursor-not-allowed"
                : "bg-teal-700 hover:bg-teal-600 text-stone-100"
            }`}
          >
            Submit
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
