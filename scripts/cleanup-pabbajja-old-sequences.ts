// scripts/cleanup-pabbajja-old-sequences.ts
// ─── ONE-OFF CLEANUP FOR PABBAJJĀ COURSE REWRITE ───
//
// Usage: npx tsx scripts/cleanup-pabbajja-old-sequences.ts
//
// The Pabbajjā course was rewritten on April 15, 2026 with a new
// six-sequence structure. The old six sequences have different
// slugs, and the import script only upserts — it does not delete
// orphans. This script removes the old sequences so the new ones
// appear alone on the course page.
//
// Safe and idempotent. Cascades to steps, progress, and responses
// via the schema's onDelete:Cascade rules.
//
// Run this BEFORE `npx tsx scripts/import-content.ts content/gt-course-1-pabbajja.json`.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COURSE_SLUG = "pabbajja";
const OLD_SEQUENCE_SLUGS = [
  "before-technique",
  "reading-the-suttas-directly",
  "the-problem-of-sensuality",
  "the-right-order",
  "what-this-series-asks",
  "where-this-leads",
];

async function main() {
  const course = await prisma.course.findUnique({
    where: { slug: COURSE_SLUG },
    include: { sequences: { select: { id: true, slug: true, title: true } } },
  });

  if (!course) {
    console.log(`No course found with slug "${COURSE_SLUG}". Nothing to clean.`);
    return;
  }

  console.log(`Course: ${course.title} (${course.sequences.length} existing sequences)`);

  const toDelete = course.sequences.filter((s) =>
    OLD_SEQUENCE_SLUGS.includes(s.slug)
  );

  if (toDelete.length === 0) {
    console.log("No old sequences to delete. Already clean.");
    return;
  }

  console.log(`\nDeleting ${toDelete.length} old sequences:`);
  for (const s of toDelete) {
    console.log(`  - ${s.slug} (${s.title})`);
  }

  const result = await prisma.sequence.deleteMany({
    where: {
      courseId: course.id,
      slug: { in: OLD_SEQUENCE_SLUGS },
    },
  });

  console.log(`\nDeleted ${result.count} sequences. Cascades handled steps, progress, and responses.`);
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
