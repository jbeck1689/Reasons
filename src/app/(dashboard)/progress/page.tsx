import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          sequences: {
            where: { published: true },
            orderBy: { sortOrder: "asc" },
            include: {
              steps: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  // Get all step progress for this user
  const progress = await prisma.stepProgress.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    select: { stepId: true },
  });

  const completedStepIds = new Set(progress.map((p) => p.stepId));

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-100 mb-2">
          Your Progress
        </h1>
        <p className="text-stone-500 text-sm">
          Track your learning across courses and sequences.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500 mb-4">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/courses"
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-stone-100 font-medium rounded transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map(({ course }) => {
            const totalSteps = course.sequences.reduce(
              (sum, seq) => sum + seq.steps.length,
              0
            );
            const completedSteps = course.sequences.reduce(
              (sum, seq) =>
                sum +
                seq.steps.filter((step) => completedStepIds.has(step.id))
                  .length,
              0
            );
            const percent =
              totalSteps > 0
                ? Math.round((completedSteps / totalSteps) * 100)
                : 0;

            return (
              <div
                key={course.id}
                className="border border-stone-800 rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-lg font-medium text-stone-200 hover:text-teal-400 transition-colors"
                  >
                    {course.title}
                  </Link>
                  <span className="text-sm text-stone-500">{percent}%</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-teal-700 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Sequences */}
                <div className="space-y-2">
                  {course.sequences.map((seq) => {
                    const seqCompleted = seq.steps.filter((step) =>
                      completedStepIds.has(step.id)
                    ).length;
                    const seqTotal = seq.steps.length;

                    return (
                      <Link
                        key={seq.id}
                        href={`/learn/${seq.id}`}
                        className="flex items-center justify-between p-3 rounded bg-stone-900/50 hover:bg-stone-900 transition-colors"
                      >
                        <span className="text-sm text-stone-400">
                          {seq.title}
                        </span>
                        <span className="text-xs text-stone-600">
                          {seqCompleted}/{seqTotal} steps
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
