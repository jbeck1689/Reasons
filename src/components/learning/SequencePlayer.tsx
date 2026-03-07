"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { InstructionStep } from "./InstructionStep";
import { MultipleChoiceStep } from "./MultipleChoiceStep";
import { FreeResponseStep } from "./FreeResponseStep";

interface StepData {
  id: string;
  type: string;
  sortOrder: number;
  content: Record<string, unknown>;
}

interface SequenceProps {
  sequence: {
    id: string;
    title: string;
    description: string | null;
    course: { id: string; title: string };
    steps: StepData[];
  };
}

export function SequencePlayer({ sequence }: SequenceProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const steps = sequence.steps;
  const progress =
    ((currentStepIndex + (completed ? 1 : 0)) / steps.length) * 100;

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      window.scrollTo(0, 0);
    } else {
      setCompleted(true);
    }
  }, [currentStepIndex, steps.length]);

  const submitResponse = useCallback(
    async (stepId: string, response: unknown) => {
      try {
        await fetch(`/api/progress/${stepId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response }),
        });
      } catch {
        // Submission failed silently — don't block the learning experience.
        // In production, we'd queue and retry.
      }
    },
    []
  );

  const markComplete = useCallback(async (stepId: string) => {
    try {
      await fetch(`/api/progress/${stepId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Same — don't block the experience
    }
  }, []);

  if (completed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-6">
          <div className="text-4xl font-light text-teal-400">◆</div>
          <h1 className="text-2xl font-semibold text-teal-400">
            Sequence Complete
          </h1>
          <div className="text-stone-400 space-y-3">
            <p className="text-lg">
              <span className="text-stone-200 font-medium">
                {sequence.title}
              </span>
            </p>
            <p className="leading-relaxed">
              You&apos;ve completed this sequence. Return to the course to continue
              with the next one.
            </p>
          </div>
          <div className="flex gap-4 justify-center pt-2">
            <Link
              href={`/courses/${sequence.course.id}`}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-stone-100 font-medium rounded transition-colors"
            >
              Back to Course
            </Link>
            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setCompleted(false);
              }}
              className="px-6 py-2.5 border border-stone-700 hover:border-stone-500 text-stone-300 font-medium rounded transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const step = steps[currentStepIndex];
  const stepLabel =
    step.type === "INSTRUCTION"
      ? "Lesson"
      : step.type === "MULTIPLE_CHOICE"
        ? "Challenge"
        : step.type === "FREE_RESPONSE"
          ? "Reflect"
          : "Step";

  return (
    <>
      {/* Sub-header with progress */}
      <div className="sticky top-[49px] bg-stone-950 border-b border-stone-800 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-stone-600 tracking-wide uppercase">
                {sequence.course.title}
              </span>
              <h2 className="text-sm font-medium text-stone-400">
                {sequence.title}
              </h2>
            </div>
            <span className="text-xs text-stone-600">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
          <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-700 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-4">
          <span className="text-xs font-medium text-teal-600 tracking-wider uppercase">
            {stepLabel}
          </span>
        </div>

        {step.type === "INSTRUCTION" && (
          <InstructionStep
            key={step.id}
            content={step.content as { body: string }}
            onNext={() => {
              markComplete(step.id);
              handleNext();
            }}
          />
        )}

        {step.type === "MULTIPLE_CHOICE" && (
          <MultipleChoiceStep
            key={step.id}
            content={
              step.content as {
                prompt: string;
                options: {
                  id: string;
                  text: string;
                  isCorrect: boolean;
                  explanation?: string;
                }[];
              }
            }
            onSubmit={(response) => submitResponse(step.id, response)}
            onNext={handleNext}
          />
        )}

        {step.type === "FREE_RESPONSE" && (
          <FreeResponseStep
            key={step.id}
            content={
              step.content as {
                prompt: string;
                sampleAnswer?: string;
              }
            }
            onSubmit={(response) => submitResponse(step.id, response)}
            onNext={handleNext}
          />
        )}
      </div>
    </>
  );
}
