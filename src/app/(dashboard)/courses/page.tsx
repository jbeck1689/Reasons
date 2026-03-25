import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const branchMeta: Record<string, { title: string; subtitle: string }> = {
  reasoning: {
    title: "Practical Reasoning",
    subtitle: "Spot the tricks. Think under pressure. Build better arguments.",
  },
  "buddhist-studies": {
    title: "Buddhist Studies & Critical Thinking",
    subtitle:
      "The four noble truths as a framework for understanding suffering — examined, not believed.",
  },
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { branch?: string };
}) {
  const branch = searchParams.branch;
  const meta = branch ? branchMeta[branch] : null;

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(branch ? { category: branch } : {}),
    },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { sequences: { where: { published: true } } } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        {meta ? (
          <>
            <div className="mb-4">
              <Link
                href="/home"
                className="text-xs text-surface-600 hover:text-accent-400 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
            <h1 className="text-2xl font-serif font-semibold text-surface-100 mb-2">
              {meta.title}
            </h1>
            <p className="text-surface-500 text-sm">{meta.subtitle}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-serif font-semibold text-surface-100 mb-2">
              All Courses
            </h1>
            <p className="text-surface-500 text-sm">
              Every course across both branches. Start anywhere.
            </p>
          </>
        )}
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block p-5 rounded-lg border border-surface-700/50 bg-surface-850 hover:border-accent-700/40 hover:bg-surface-800 transition-all"
          >
            <h2 className="text-lg font-serif font-medium text-surface-100 mb-1">
              {course.title}
            </h2>
            <p className="text-sm text-surface-400 leading-relaxed mb-3">
              {course.description}
            </p>
            <span className="text-xs text-surface-600">
              {course._count.sequences}{" "}
              {course._count.sequences === 1 ? "sequence" : "sequences"}
            </span>
          </Link>
        ))}

        {courses.length === 0 && (
          <p className="text-surface-600 text-sm">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}
