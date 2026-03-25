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

  const backHref = `/courses?branch=${course.category}`;
  const branchLabel =
    course.category === "buddhist-studies"
      ? "Buddhist Studies"
      : "Practical Reasoning";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href={backHref}
        className="text-xs text-surface-600 hover:text-accent-400 transition-colors"
      >
        ← {branchLabel}
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-serif font-semibold text-surface-100 mb-2">
          {course.title}
        </h1>
        <p className="text-surface-400 text-sm leading-relaxed font-serif">
          {course.description}
        </p>
      </div>

      <div className="space-y-3">
        {course.sequences.map((seq, index) => (
          <Link
            key={seq.id}
            href={`/learn/${seq.id}`}
            className="block p-4 rounded-lg border border-surface-700/50 bg-surface-850 hover:border-accent-700/40 hover:bg-surface-800 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-accent-900/60 border border-accent-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-accent-300">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-surface-200">
                  {seq.title}
                </h3>
                {seq.description && (
                  <p className="text-xs text-surface-500 mt-1">
                    {seq.description}
                  </p>
                )}
                <span className="text-xs text-surface-600 mt-2 block">
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
