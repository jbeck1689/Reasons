import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _request: Request,
  { params }: { params: { stepId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const { stepId } = params;

  try {
    const step = await prisma.step.findUnique({
      where: { id: stepId },
      select: { id: true },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    await prisma.stepProgress.upsert({
      where: { userId_stepId: { userId, stepId } },
      create: {
        userId,
        stepId,
        status: "COMPLETED",
        attempts: 1,
        completedAt: new Date(),
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ status: "completed" });
  } catch {
    return NextResponse.json(
      { error: "Failed to mark step complete" },
      { status: 500 }
    );
  }
}
