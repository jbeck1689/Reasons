// src/lib/validations/content.ts
// ─── CONTENT VALIDATION SCHEMAS ───
// Validates step content for each type before import to database.

import { z } from "zod";

// ─── STEP CONTENT SCHEMAS ───

export const InstructionContentSchema = z.object({
  body: z.string().min(1, "Instruction body cannot be empty"),
  media: z
    .array(
      z.object({
        type: z.string().min(1),
        url: z.string().url(),
        alt: z.string().optional(),
      })
    )
    .optional(),
});

export const MultipleChoiceOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

export const MultipleChoiceContentSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  options: z
    .array(MultipleChoiceOptionSchema)
    .min(2, "Must have at least 2 options")
    .max(6, "Must have at most 6 options"),
  shuffleOptions: z.boolean().optional().default(false),
});

export const FreeResponseContentSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  rubric: z
    .object({
      criteria: z.array(z.string()),
      maxScore: z.number(),
    })
    .optional(),
  sampleAnswer: z.string().optional(),
});

export const FillInBlankContentSchema = z.object({
  prompt: z.string().min(1),
  text: z.string().min(1, "Text with blanks cannot be empty"),
  blanks: z
    .array(
      z.object({
        id: z.string().min(1),
        acceptableAnswers: z.array(z.string().min(1)).min(1),
        explanation: z.string().optional(),
      })
    )
    .min(1, "Must have at least one blank"),
});

export const OrderingContentSchema = z.object({
  prompt: z.string().min(1),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        correctPosition: z.number().int().min(0),
      })
    )
    .min(2, "Must have at least 2 items to order"),
});

export const MatchingContentSchema = z.object({
  prompt: z.string().min(1),
  pairs: z
    .array(
      z.object({
        id: z.string().min(1),
        left: z.string().min(1),
        right: z.string().min(1),
      })
    )
    .min(2, "Must have at least 2 pairs"),
});

export const TranslationContentSchema = z.object({
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
  sourceText: z.string().min(1),
  acceptableAnswers: z.array(z.string().min(1)).min(1),
  notes: z.string().optional(),
});

export const RhetoricalAnalysisContentSchema = z.object({
  passage: z.string().min(1),
  devices: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        startIndex: z.number().int().min(0),
        endIndex: z.number().int().min(0),
        explanation: z.string().min(1),
      })
    )
    .min(1),
  prompt: z.string().min(1),
});

export const CheckpointContentSchema = z.object({
  prompt: z.string().min(1),
  questions: z
    .array(
      z.object({
        id: z.string().min(1),
        prompt: z.string().min(1),
        options: z
          .array(MultipleChoiceOptionSchema)
          .min(2)
          .max(6),
      })
    )
    .min(3, "Checkpoint must have at least 3 questions")
    .max(5, "Checkpoint must have at most 5 questions"),
  passingScore: z.number().min(0).max(1).optional().default(0.8),
});

// ─── STEP METADATA SCHEMAS ───

export const LlmConfigSchema = z.object({
  llmEnabled: z.boolean().default(false),
  evaluationPrompt: z.string().optional(),
  rubricCriteria: z.array(z.string()).optional(),
  feedbackTone: z.union([
    z.literal("encouraging"),
    z.literal("direct"),
    z.literal("socratic"),
  ]).optional(),
  maxTokens: z.number().int().positive().optional(),
});

export const StepMetadataSchema = z.object({
  llmConfig: LlmConfigSchema.optional(),
  hints: z.array(z.string()).optional(),
  difficulty: z.union([
    z.literal("easy"),
    z.literal("medium"),
    z.literal("hard"),
  ]).optional(),
  tags: z.array(z.string()).optional(),
}).passthrough(); // Allow additional metadata fields

// ─── STEP TYPE TO SCHEMA MAP ───

const StepContentSchemas: { [key: string]: z.ZodType } = {
  INSTRUCTION: InstructionContentSchema,
  MULTIPLE_CHOICE: MultipleChoiceContentSchema,
  FREE_RESPONSE: FreeResponseContentSchema,
  FILL_IN_BLANK: FillInBlankContentSchema,
  ORDERING: OrderingContentSchema,
  MATCHING: MatchingContentSchema,
  TRANSLATION: TranslationContentSchema,
  RHETORICAL_ANALYSIS: RhetoricalAnalysisContentSchema,
  CHECKPOINT: CheckpointContentSchema,
};

// ─── VALID STEP TYPES ───

const VALID_STEP_TYPES = [
  "INSTRUCTION",
  "MULTIPLE_CHOICE",
  "MULTI_SELECT",
  "FREE_RESPONSE",
  "FILL_IN_BLANK",
  "ORDERING",
  "MATCHING",
  "TRANSLATION",
  "RHETORICAL_ANALYSIS",
  "CHECKPOINT",
] as const;

// ─── IMPORT FILE SCHEMAS ───

export const ImportStepSchema = z.object({
  type: z.string().min(1),
  sortOrder: z.number().int().min(0),
  content: z.object({}).passthrough(),
  metadata: z.object({}).passthrough().optional(),
});

export const ImportSequenceSchema = z.object({
  title: z.string().min(1, "Sequence title cannot be empty"),
  slug: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0),
  published: z.boolean().optional().default(false),
  steps: z.array(ImportStepSchema).min(1, "Sequence must have at least one step"),
});

export const ImportCourseSchema = z.object({
  title: z.string().min(1, "Course title cannot be empty"),
  slug: z.string().min(1),
  description: z.string().min(1, "Course description cannot be empty"),
  category: z.string().optional().default("reasoning"),
  sortOrder: z.number().int().min(0).optional().default(0),
  published: z.boolean().optional().default(false),
  sequences: z.array(ImportSequenceSchema).min(1, "Course must have at least one sequence"),
});

// ─── CONTENT VALIDATOR ───

export function validateStepContent(
  type: string,
  content: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  if (!VALID_STEP_TYPES.includes(type as (typeof VALID_STEP_TYPES)[number])) {
    return { success: false, error: `Unknown step type: ${type}` };
  }

  const schema = StepContentSchemas[type];
  if (!schema) {
    return { success: true, data: content };
  }

  const result = schema.safeParse(content);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  return { success: false, error: `Content validation failed:\n${issues}` };
}
