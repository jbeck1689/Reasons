export interface InstructionContent {
  body: string;
  media?: {
    type: "image" | "audio" | "video";
    url: string;
    alt?: string;
  }[];
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface MultipleChoiceContent {
  prompt: string;
  options: MultipleChoiceOption[];
  shuffleOptions: boolean;
}

export interface FreeResponseContent {
  prompt: string;
  rubric?: {
    criteria: string[];
    maxScore: number;
  };
  sampleAnswer?: string;
}

export interface StepData {
  id: string;
  type: "INSTRUCTION" | "MULTIPLE_CHOICE" | "FREE_RESPONSE";
  sortOrder: number;
  content: InstructionContent | MultipleChoiceContent | FreeResponseContent;
}

export interface SequenceData {
  id: string;
  title: string;
  description: string | null;
  course: {
    id: string;
    title: string;
  };
  steps: StepData[];
}
