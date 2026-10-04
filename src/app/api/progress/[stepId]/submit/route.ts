import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { submissionLimiter } from "@/lib/utils/rate-limit";
import { logger } from "@/lib/utils/logger";

// Max response payload: 10KB. No legitimate free response is larger.
const MAX_RESPONSE_SIZE = 10_000;

const SubmitPayloadSchema = z.object({
  response: z.object({}).passthrough().refine(
    (val) => JSON.stringify(val).length <= MAX_RESPONSE_SIZE,
    { message: "Response too large" }
  ),
});

export async function POST(
  request: Request,
  { params }: { params: { stepId: string } }
) {
  // Check who's making this request
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const { stepId } = params;

  // Rate limit: 30 submissions/minute per user
  const rateCheck = await submissionLimiter.check(userId);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please slow down." },
      { status: 429 }
    );
  }

  try {
    // Validate the request body shape and size
    const body = await request.json();
    const parsed = SubmitPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { response } = parsed.data;

    // Look up the step AND verify the user is enrolled in its course
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      select: {
        id: true,
        type: true,
        content: true,
        metadata: true,
        sequence: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // Verify enrollment — a user can only submit to steps in courses they're enrolled in
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: step.sequence.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Score the response based on step type
    let score: number | null = null;
    let feedback: Prisma.InputJsonValue | undefined = undefined;

    if (step.type === "MULTIPLE_CHOICE") {
      const content = step.content as {
        options: { id: string; isCorrect: boolean; explanation?: string }[];
      };
      const selectedOption = content.options.find(
        (o) => o.id === (response as Record<string, unknown>).selectedOptionId
      );
      if (selectedOption) {
        score = selectedOption.isCorrect ? 1.0 : 0.0;
        feedback = {
          isCorrect: selectedOption.isCorrect,
          explanation: selectedOption.explanation || "",
        };
      }
    } else if (step.type === "FREE_RESPONSE") {
      // Check if LLM evaluation is enabled for this step
      const metadata = step.metadata as { llmEnabled?: boolean } | null;
      if (metadata?.llmEnabled) {
        // LLM evaluation not yet implemented — return a helpful message
        // This will be replaced in Phase 6 with actual LLM evaluation
        logger.warn({ stepId, userId }, "LLM evaluation requested but not yet enabled");
        score = null;
        feedback = {
          sampleAnswer: (step.content as { sampleAnswer?: string }).sampleAnswer || "",
          note: "Intelligent feedback coming soon.",
        };
      } else {
        score = null;
        const content = step.content as { sampleAnswer?: string };
        feedback = {
          sampleAnswer: content.sampleAnswer || "",
        };
      }
    }

    // Store the response in the filing cabinet
    await prisma.userResponse.create({
      data: {
        userId,
        stepId,
        response: response as Prisma.InputJsonValue,
        score,
        feedback,
      },
    });

    // Update progress
    await prisma.stepProgress.upsert({
      where: { userId_stepId: { userId, stepId } },
      create: {
        userId,
        stepId,
        status: "COMPLETED",
        attempts: 1,
        bestScore: score,
        lastAttempt: new Date(),
        completedAt: new Date(),
      },
      update: {
        status: "COMPLETED",
        attempts: { increment: 1 },
        bestScore:
          score !== null
            ? { set: score }
            : undefined,
        lastAttempt: new Date(),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      score,
      feedback,
    });
  } catch (error) {
    logger.error({ error, stepId, userId }, "Failed to submit response");
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
