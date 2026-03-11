"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  const stepContentRef = useRef<HTMLDivElement>(null);

  const steps = sequence.steps;
  const progress =
    ((currentStepIndex + (completed ? 1 : 0)) / steps.length) * 100;

  useEffect(() => {
    if (stepContentRef.current) {
      stepContentRef.current.focus();
    }
  }, [currentStepIndex]);

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
        // Submission failed silently
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
          <div className="text-4xl font-light text-accent-400">◆</div>
          <h1 className="text-2xl font-serif font-semibold text-accent-400">
            Sequence Complete
          </h1>
          <div className="text-surface-400 space-y-3">
            <p className="text-lg font-serif">
              <span className="text-surface-200 font-medium">
                {sequence.title}
              </span>
            </p>
            <p className="leading-relaxed font-serif">
              You&apos;ve completed this sequence. Return to the course to continue
              with the next one.
            </p>
          </div>
          <div className="flex gap-4 justify-center pt-2">
            <Link
              href={`/courses/${sequence.course.id}`}
              className="px-6 py-2.5 bg-accent-600 hover:bg-accent-500 text-surface-950 font-medium rounded transition-colors"
            >
              Back to Course
            </Link>
            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setCompleted(false);
              }}
              className="px-6 py-2.5 border border-surface-700 hover:border-surface-500 text-surface-300 font-medium rounded transition-colors"
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
      <div className="sticky top-[49px] bg-surface-900/95 backdrop-blur-sm border-b border-surface-700/50 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-surface-600 tracking-wide uppercase">
                {sequence.course.title}
              </span>
              <h2 className="text-sm font-medium text-surface-400">
                {sequence.title}
              </h2>
            </div>
            <span className="text-xs text-surface-600">
              {currentStepIndex + 1} / {steps.length}
            </span>
          </div>
          <div
            className="h-1 bg-surface-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Sequence progress: ${Math.round(progress)}%`}
          >
            <div
              className="h-full bg-accent-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div
        ref={stepContentRef}
        tabIndex={-1}
        className="max-w-2xl mx-auto px-6 py-8 outline-none"
        aria-label={`Step ${currentStepIndex + 1} of ${steps.length}: ${stepLabel}`}
      >
        <div className="mb-4">
          <span className="text-xs font-medium text-accent-500 tracking-wider uppercase">
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
