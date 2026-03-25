// scripts/import-content.ts
// ─── CONTENT IMPORT PIPELINE ───
//
// Usage: npx ts-node scripts/import-content.ts <path-to-json-file>
//
// Reads a JSON file containing a course (with sequences and steps),
// validates every piece against Zod schemas, and writes it to the
// database using upsert (safe to re-run without duplicating data).
//
// The JSON file format:
// {
//   "title": "Course Title",
//   "slug": "course-slug",
//   "description": "What this course teaches.",
//   "sortOrder": 1,
//   "published": true,
//   "sequences": [
//     {
//       "title": "Sequence Title",
//       "slug": "sequence-slug",
//       "description": "What this sequence covers.",
//       "sortOrder": 1,
//       "published": true,
//       "steps": [
//         {
//           "type": "INSTRUCTION",
//           "sortOrder": 0,
//           "content": { "body": "Lesson text here..." }
//         },
//         {
//           "type": "MULTIPLE_CHOICE",
//           "sortOrder": 1,
//           "content": {
//             "prompt": "Question text...",
//             "options": [
//               { "id": "a", "text": "Option A", "isCorrect": false, "explanation": "Why not." },
//               { "id": "b", "text": "Option B", "isCorrect": true, "explanation": "Why yes." }
//             ],
//             "shuffleOptions": false
//           }
//         }
//       ]
//     }
//   ]
// }

import { PrismaClient, StepType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import {
  ImportCourseSchema,
  validateStepContent,
} from "../src/lib/validations/content";

const prisma = new PrismaClient();

// ─── COLORS FOR TERMINAL OUTPUT ───
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

async function importContent(filePath: string) {
  // ─── STEP 1: READ THE FILE ───
  console.log(`\nReading ${filePath}...`);

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(red(`File not found: ${absolutePath}`));
    process.exit(1);
  }

  let rawJson: unknown;
  try {
    const fileContent = fs.readFileSync(absolutePath, "utf-8");
    rawJson = JSON.parse(fileContent);
  } catch (err) {
    console.error(red(`Failed to parse JSON: ${(err as Error).message}`));
    process.exit(1);
  }

  // ─── STEP 2: VALIDATE COURSE STRUCTURE ───
  console.log("Validating course structure...");

  const courseResult = ImportCourseSchema.safeParse(rawJson);
  if (!courseResult.success) {
    console.error(red("\nCourse structure validation failed:"));
    for (const issue of courseResult.error.issues) {
      console.error(red(`  - ${issue.path.join(".")}: ${issue.message}`));
    }
    process.exit(1);
  }

  const courseData = courseResult.data;

  // ─── STEP 3: VALIDATE EVERY STEP'S CONTENT ───
  console.log("Validating step content...");

  let errors = 0;
  for (const seq of courseData.sequences) {
    for (const step of seq.steps) {
      const result = validateStepContent(step.type, step.content);
      if (!result.success) {
        console.error(
          red(`\n[${seq.slug} → step ${step.sortOrder} (${step.type})]`)
        );
        console.error(red(result.error));
        errors++;
      }
    }
  }

  if (errors > 0) {
    console.error(red(`\n${errors} step(s) failed content validation. Import aborted.`));
    process.exit(1);
  }

  console.log(green("All content validated successfully."));

  // ─── STEP 4: COUNT WHAT WE'RE IMPORTING ───
  const totalSequences = courseData.sequences.length;
  const totalSteps = courseData.sequences.reduce(
    (sum, seq) => sum + seq.steps.length,
    0
  );
  console.log(
    dim(`\nImporting: 1 course, ${totalSequences} sequences, ${totalSteps} steps`)
  );

  // ─── STEP 5: WRITE TO DATABASE ───
  console.log("\nWriting to database...");

  // Upsert the course
  const course = await prisma.course.upsert({
    where: { slug: courseData.slug },
    update: {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      sortOrder: courseData.sortOrder,
      published: courseData.published,
    },
    create: {
      title: courseData.title,
      slug: courseData.slug,
      description: courseData.description,
      category: courseData.category,
      sortOrder: courseData.sortOrder,
      published: courseData.published,
    },
  });
  console.log(green(`  ✓ Course: ${course.title}`));

  // Upsert each sequence and its steps
  for (const seqData of courseData.sequences) {
    const sequence = await prisma.sequence.upsert({
      where: {
        courseId_slug: { courseId: course.id, slug: seqData.slug },
      },
      update: {
        title: seqData.title,
        description: seqData.description ?? null,
        sortOrder: seqData.sortOrder,
        published: seqData.published,
      },
      create: {
        courseId: course.id,
        title: seqData.title,
        slug: seqData.slug,
        description: seqData.description ?? null,
        sortOrder: seqData.sortOrder,
        published: seqData.published,
      },
    });
    console.log(green(`  ✓ Sequence: ${sequence.title}`) + dim(` (${seqData.steps.length} steps)`));

    // Delete existing steps for this sequence before re-importing.
    // This handles step edits, reordering, and removal cleanly.
    // Progress and response data reference step IDs, so this is
    // a clean slate — appropriate during content development.
    // In production, you'd want a migration strategy instead.
    await prisma.step.deleteMany({
      where: { sequenceId: sequence.id },
    });

    // Create all steps
    for (const stepData of seqData.steps) {
      await prisma.step.create({
        data: {
          sequenceId: sequence.id,
          type: stepData.type as StepType,
          sortOrder: stepData.sortOrder,
          content: stepData.content as object,
          metadata: (stepData.metadata as object) ?? undefined,
        },
      });
    }
    console.log(dim(`    ${seqData.steps.length} steps created`));
  }

  // ─── DONE ───
  console.log(green(`\nImport complete.`));
  console.log(
    dim(
      `  Course "${courseData.title}" → ${totalSequences} sequences, ${totalSteps} steps`
    )
  );
}

// ─── RUN ───

const filePath = process.argv[2];
if (!filePath) {
  console.error(red("Usage: npx ts-node scripts/import-content.ts <path-to-json-file>"));
  console.error(dim("  Example: npx ts-node scripts/import-content.ts content/course-1.json"));
  process.exit(1);
}

importContent(filePath)
  .catch((err) => {
    console.error(red(`\nImport failed: ${err.message}`));
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
