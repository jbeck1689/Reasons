import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { sequences: { where: { published: true } } } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-surface-100 mb-2">
          Courses
        </h1>
        <p className="text-surface-500 text-sm">
          Each course teaches a different kind of thinking. Start anywhere.
        </p>
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
