import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SequencePlayer } from "@/components/learning/SequencePlayer";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
}: {
  params: { sequenceId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sequence = await prisma.sequence.findUnique({
    where: { id: params.sequenceId, published: true },
    include: {
      course: { select: { id: true, title: true } },
      steps: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          type: true,
          sortOrder: true,
          content: true,
        },
      },
    },
  });

  if (!sequence) {
    notFound();
  }

  // Auto-enroll: if the user isn't enrolled in this course, enroll them now
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: sequence.course.id,
      },
    },
    create: {
      userId: session.user.id,
      courseId: sequence.course.id,
    },
    update: {},
  });

  return (
    <SequencePlayer
      sequence={{
        id: sequence.id,
        title: sequence.title,
        description: sequence.description,
        course: sequence.course,
        steps: sequence.steps.map((step) => ({
          id: step.id,
          type: step.type as "INSTRUCTION" | "MULTIPLE_CHOICE" | "FREE_RESPONSE",
          sortOrder: step.sortOrder,
          content: step.content as Record<string, unknown>,
        })),
      }}
    />
  );
}
