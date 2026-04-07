import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const topicMeta: Record<string, { title: string; subtitle: string; backHref: string; backLabel: string }> = {
  reasoning: {
    title: "Practical Reasoning",
    subtitle: "Spot the tricks. Think under pressure. Build better arguments.",
    backHref: "/home",
    backLabel: "← Courses",
  },
  "four-noble-truths": {
    title: "The Four Noble Truths",
    subtitle: "A diagnostic framework for suffering — examined through critical thinking, not belief.",
    backHref: "/buddhist-studies",
    backLabel: "← Buddhist Studies",
  },
  "dependent-origination": {
    title: "Dependent Origination — Paṭiccasamuppāda",
    subtitle: "Nothing arises independently. The twelve-link chain that constructs experience and suffering from conditions.",
    backHref: "/buddhist-studies",
    backLabel: "← Buddhist Studies",
  },
  paccaya: {
    title: "Modes of Conditionality — Paccaya",
    subtitle: "How conditions actually operate — root, object, proximity, co-arising, and the twenty-four modes that make the chain visible.",
    backHref: "/buddhist-studies",
    backLabel: "← Buddhist Studies",
  },
  "gradual-training": {
    title: "The Gradual Training — Anupubbasikkhā",
    subtitle: "The practice path of the early suttas — demystified, philosophically grounded, read for the modern practitioner through Ñāṇamoli and Ñāṇavīra.",
    backHref: "/buddhist-studies",
    backLabel: "← Buddhist Studies",
  },
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { topic?: string; branch?: string };
}) {
  // Support both topic (new) and branch (legacy) params
  const topic = searchParams.topic || searchParams.branch;
  const meta = topic ? topicMeta[topic] : null;

  const courses = await prisma.course.findMany({
    where: {
      published: true,
      ...(topic ? { category: topic } : {}),
    },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { sequences: { where: { published: true } } } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href={meta?.backHref || "/home"}
            className="text-xs text-surface-600 hover:text-accent-400 transition-colors"
          >
            {meta?.backLabel || "← Courses"}
          </Link>
        </div>
        {meta ? (
          <>
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
              Every course across all topics.
            </p>
          </>
        )}
      </div>

      <div className="space-y-4">
        {courses.map((course, index) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block p-5 rounded-xl border border-surface-700/30 bg-surface-900/50 hover:border-accent-700/30 transition-all card-hover"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-900/60 border border-accent-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-accent-300">
                  {index + 1}
                </span>
              </div>
              <div>
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
              </div>
            </div>
          </Link>
        ))}

        {courses.length === 0 && (
          <p className="text-surface-600 text-sm">No courses available yet.</p>
        )}
      </div>
    </div>
  );
}
