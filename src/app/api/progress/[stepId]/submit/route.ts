import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  try {
    const body = await request.json();
    const { response } = body;

    if (!response) {
      return NextResponse.json(
        { error: "Response is required" },
        { status: 400 }
      );
    }

    // Look up the step to know how to score it
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      select: { id: true, type: true, content: true, sequenceId: true },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // Score the response based on step type
    let score: number | null = null;
    let feedback: Prisma.InputJsonValue | undefined = undefined;

    if (step.type === "MULTIPLE_CHOICE") {
      const content = step.content as {
        options: { id: string; isCorrect: boolean; explanation?: string }[];
      };
      const selectedOption = content.options.find(
        (o) => o.id === response.selectedOptionId
      );
      if (selectedOption) {
        score = selectedOption.isCorrect ? 1.0 : 0.0;
        feedback = {
          isCorrect: selectedOption.isCorrect,
          explanation: selectedOption.explanation || "",
        };
      }
    } else if (step.type === "FREE_RESPONSE") {
      score = null;
      const content = step.content as { sampleAnswer?: string };
      feedback = {
        sampleAnswer: content.sampleAnswer || "",
      };
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
  } catch {
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 }
    );
  }
}
