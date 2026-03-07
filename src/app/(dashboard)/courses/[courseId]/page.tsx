import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId, published: true },
    include: {
      sequences: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { steps: true } },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/courses"
        className="text-xs text-stone-600 hover:text-stone-400 uppercase tracking-wider"
      >
        ← All Courses
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold text-stone-100 mb-2">
          {course.title}
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="space-y-3">
        {course.sequences.map((seq, index) => (
          <Link
            key={seq.id}
            href={`/learn/${seq.id}`}
            className="block p-4 rounded border border-stone-800 bg-stone-900/50 hover:border-stone-600 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-teal-900 border border-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-teal-300">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-stone-200">
                  {seq.title}
                </h3>
                {seq.description && (
                  <p className="text-xs text-stone-500 mt-1">
                    {seq.description}
                  </p>
                )}
                <span className="text-xs text-stone-600 mt-2 block">
                  {seq._count.steps} steps
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
