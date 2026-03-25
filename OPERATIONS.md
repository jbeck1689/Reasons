# Operations Manual — Public Reasons

Last verified: March 25, 2026

---

## What This Is

A web-based learning platform at public-reasons.vercel.app. Two content branches: Practical Reasoning (critical thinking, rhetoric, cognitive biases) and Buddhist Studies (Four Noble Truths, Dependent Origination). Adversarial framing — learners catch tricks, not study textbooks. Feedback language: "You saw through it" / "It got you. Here's how."

## Infrastructure

- **Repo:** github.com/jbeck1689/Public-Reasons (note: GitHub says this moved to /Reasons but the old URL still works)
- **Stack:** Next.js 14+, TypeScript, Prisma 5, NextAuth v4, Tailwind, Zod 4, Zustand
- **Database:** Neon PostgreSQL (free tier). Connection string uses `?sslmode=require`, no `channel_binding`.
- **Deployment:** Vercel. Project ID: `prj_LdfeEuErkgSQ3K89460JZmmsQQap`
- **Dev environment:** Jesse works in GitHub Codespaces.
- **GCP:** Fully abandoned. Do not reference Cloud Run, Cloud SQL, Docker, or cloudbuild.

## What Claude Can Do vs What Jesse Must Do

**Claude can:**
- Write content JSON files
- Commit and push to GitHub (requires a PAT — ask Jesse if not provided)
- Read the repo, validate content programmatically
- Produce downloadable files

**Claude cannot:**
- Connect to Neon (the container blocks external database connections)
- Access Jesse's Codespace
- Run imports against the live database
- Trigger Vercel deploys via API (no current token)

**Therefore:** Claude writes and pushes content. Jesse runs imports from Codespaces. Content imports go live immediately — no Vercel redeploy needed. Code changes require a git push, which triggers Vercel auto-build.

## Content Import Workflow

This is the exact sequence. Do not deviate.

1. Claude creates the JSON file in the repo's `content/` directory
2. Claude validates it programmatically (structure + content schemas)
3. Claude commits and pushes to GitHub
4. Claude confirms the push succeeded
5. Claude gives Jesse the exact import command:

```
git pull origin main
npx tsx scripts/import-content.ts content/[filename].json
```

Jesse runs this in Codespaces with `DATABASE_URL` exported. The import script uses upsert — safe to re-run.

**Before any import:** Jesse must have run `npx prisma db push` at least once since the `category` column was added to the schema. The deploy-all script (`scripts/deploy-all.sh`) handles this. If Jesse hasn't run deploy-all yet, that must happen first.

## Content Architecture

### Categories

Three categories, stored in `Course.category`:

| Category | Description | Sequences per course | Steps per sequence |
|----------|-------------|---------------------|--------------------|
| `reasoning` | Critical thinking, rhetoric, biases | 8 | 8 |
| `four-noble-truths` | Buddhist diagnostic framework | 6 | 8 |
| `dependent-origination` | The twelve-link chain | 6 | 8 |

### Step Rhythm (all categories)

Every sequence uses the same 8-step pattern:

```
1. INSTRUCTION
2. INSTRUCTION
3. MULTIPLE_CHOICE
4. INSTRUCTION
5. MULTIPLE_CHOICE
6. INSTRUCTION
7. FREE_RESPONSE
8. INSTRUCTION
```

No exceptions. Do not improvise alternative rhythms.

### Navigation Hierarchy

```
/home (post-login landing)
├── Practical Reasoning → /courses?topic=reasoning
│   └── [course] → /courses/[id]
│       └── [sequence] → /learn/[id]
└── Buddhist Studies → /buddhist-studies
    ├── Four Noble Truths → /courses?topic=four-noble-truths
    │   └── [course] → /courses/[id]
    └── Dependent Origination → /courses?topic=dependent-origination
        └── [course] → /courses/[id]
```

Courses are numbered locally within their topic group (Course 1, 2, 3...) using index+1 in the UI, not a global number.

## Content JSON Schema

Every content file must match this exact structure:

```json
{
  "title": "Course Title — Pāli Term",
  "slug": "lowercase-hyphenated",
  "description": "2-3 sentences. What this course examines.",
  "category": "dependent-origination",
  "sortOrder": 4,
  "published": true,
  "sequences": [
    {
      "title": "Sequence Title",
      "slug": "sequence-slug",
      "description": "1-2 sentences.",
      "sortOrder": 1,
      "published": true,
      "steps": [
        {
          "type": "INSTRUCTION",
          "sortOrder": 1,
          "content": {
            "body": "Markdown text. Supports **bold**, *italic*, ## headings, > blockquotes, \\n newlines."
          }
        },
        {
          "type": "MULTIPLE_CHOICE",
          "sortOrder": 3,
          "content": {
            "prompt": "Scenario + question.",
            "options": [
              {
                "id": "a",
                "text": "Option text.",
                "isCorrect": false,
                "explanation": "Why this is wrong — must teach something, not just say 'incorrect.'"
              },
              {
                "id": "b",
                "text": "Option text.",
                "isCorrect": true,
                "explanation": "Why this is right."
              },
              {
                "id": "c",
                "text": "Option text.",
                "isCorrect": false,
                "explanation": "Why this is wrong."
              }
            ],
            "shuffleOptions": false
          }
        },
        {
          "type": "FREE_RESPONSE",
          "sortOrder": 7,
          "content": {
            "prompt": "Open-ended question or reflective exercise.",
            "sampleAnswer": "Not a 'correct' answer but a debrief — what the exercise was designed to surface."
          }
        }
      ]
    }
  ]
}
```

**Validation rules:**
- Every MC question has exactly 3 options with IDs "a", "b", "c"
- Exactly one option has `isCorrect: true`
- `shuffleOptions` is always `false`
- `sortOrder` for steps is 1-indexed, sequential within each sequence
- `sortOrder` for sequences is 1-indexed, sequential within each course
- Slugs are unique within their scope (course slugs globally, sequence slugs within course)
- Category must be one of: `reasoning`, `four-noble-truths`, `dependent-origination`
- Older reasoning courses may omit category — the import script defaults to `"reasoning"`

## Content Inventory (in repo)

### Practical Reasoning (category: reasoning)

| File | Title | Seqs | Steps | Category in JSON |
|------|-------|------|-------|-----------------|
| course-1-dont-get-tricked.json | Don't Get Tricked | 8 | 65 | missing (defaults to reasoning) |
| course-2-rhetorical-devices.json | Rhetorical Devices | 8 | 64 | missing |
| course-2-think-before-you-decide.json | Think Before You Decide | 8 | 64 | missing |
| course-3-build-your-case.json | Build Your Case | 8 | 60 | missing |
| course-5-read-the-room.json | Read the Room | 8 | 64 | missing |
| course-6-numbers-dont-lie.json | Numbers Don't Lie | 8 | 64 | missing |

### Four Noble Truths (category: four-noble-truths)

| File | Title | Seqs | Steps |
|------|-------|------|-------|
| course-7-something-is-off.json | Something Is Off — Understanding Suffering | 6 | 48 |
| course-8-the-engine.json | The Engine — The Mechanics of Craving | 6 | 48 |
| course-9-the-clearing.json | The Clearing — When the Engine Stops | 6 | 48 |
| course-10-the-practice.json | The Practice — Walking the Path | 6 | 48 |

### Dependent Origination (category: dependent-origination)

| File | Title | Sort | Seqs | Steps | Status |
|------|-------|------|------|-------|--------|
| do-course-1-avijja.json | Ignorance — Avijjā | 1 | 6 | 48 | In repo |
| do-course-2-sankhara.json | Formations — Saṅkhāra | 2 | 6 | 48 | In repo |
| do-course-3-vinnana.json | Consciousness — Viññāṇa | 3 | 6 | 48 | In repo |
| do-course-4-namarupa.json | Name-and-Form — Nāmarūpa | 4 | 6 | 48 | In repo |
| do-course-5-salayatana.json | Six Sense Bases — Saḷāyatana | 5 | — | — | NOT WRITTEN |
| do-course-6-phassa.json | Contact — Phassa | 6 | — | — | NOT WRITTEN |
| do-course-7-vedana.json | Feeling — Vedanā | 7 | — | — | NOT WRITTEN |
| do-course-8-tanha.json | Craving — Taṇhā | 8 | — | — | NOT WRITTEN |
| do-course-9-upadana.json | Clinging — Upādāna | 9 | — | — | NOT WRITTEN |
| do-course-10-bhava.json | Becoming — Bhava | 10 | — | — | NOT WRITTEN |
| do-course-11-jati.json | Birth — Jāti | 11 | — | — | NOT WRITTEN |
| do-course-12-jaramarana.json | Aging and Death — Jarāmaraṇa | 12 | — | — | NOT WRITTEN |
| do-course-13-whole-chain.json | The Whole Chain | 13 | — | — | NOT WRITTEN |

### Reference (not for import)

| File | Note |
|------|------|
| reference/course-11-the-twelve-links-original.json | Original single-course DO draft, replaced by the 13-course series |
| test-import.json | Test file, unpublished |

## Deployment Status — CRITICAL

**As of March 25, 2026: deploy-all has NOT been confirmed as run.** Assume the following until Jesse confirms otherwise:

- The `category` column may not exist in the Neon database
- None of the Four Noble Truths courses may be in the database
- None of the Dependent Origination courses may be in the database
- The reasoning courses exist but possibly without category values

**At the start of every session, if content work is planned, confirm with Jesse:** "Have you run deploy-all? Is the category column in your database?" If unknown, the safe path is to run deploy-all again (it's idempotent).

**deploy-all.sh is stale.** It covers through do-course-3-vinnana.json only. Nāmarūpa and all future DO courses must be imported individually after deploy-all runs.

**The full deployment sequence for Jesse (if starting from scratch):**
```bash
export DATABASE_URL="postgresql://neondb_owner:npg_LpmzajJI8nD3@ep-winter-mouse-adx3tcd9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
git pull origin main
bash scripts/deploy-all.sh
npx tsx scripts/import-content.ts content/do-course-4-namarupa.json
```

## Known Legacy Issues (Do Not Fix — Document Only)

These exist in early content files. They are cosmetic inconsistencies, not bugs. Do not spend tokens investigating or repairing them.

**Course 1 (Don't Get Tricked):** All 8 sequences use a non-standard step rhythm — they have extra MULTIPLE_CHOICE steps (typically 9 steps per sequence instead of 8). This was the first course written, before the rhythm was standardized. The app renders them fine.

**Course 3 (Build Your Case):** Four sequences have only 7 steps (missing the final INSTRUCTION). Total is 60 steps instead of 64.

**Course 10 (The Practice):** One sequence (`the-long-game`) has a non-standard rhythm — two extra INSTRUCTION steps where MULTIPLE_CHOICE was expected.

**Courses 2 (Rhetorical Devices), 2 (Think Before You Decide):** A handful of sequences have minor rhythm variations (e.g., swapped INSTRUCTION/MULTIPLE_CHOICE positions).

**All reasoning courses (1-6):** Missing `category` field in their JSON files. The import script defaults to `"reasoning"`. This is handled; no action needed.

None of these affect the user experience. The player renders whatever step types it receives.

## Content Authoring Conventions (Buddhist Studies)

**Tone:** Serious but approachable. No mysticism, no devotional language, no belief required. Direct address ("you"), present tense when describing experience. The platform is explicitly personal — built for Jesse's own learning. Not preachy, not academic.

**Sources:** Primarily early Pāli suttas via Bhikkhu Bodhi's translations. Cognitive neuroscience and pragmatic philosophy as parallel lenses, not replacements. Key references: Bhikkhu Bodhi for doctrinal depth, Richard Davidson, Bessel van der Kolk, David Treleaven for neuroscience and somatic dimensions.

**Pāli terms:** Use diacritical marks (ā, ī, ū, ṃ, ṇ, ṭ, ḍ, ñ, ḷ). Format: "English Translation — Pāli Term" for course titles. Bold Pāli terms on first introduction in body text.

**MC wrong answers:** Must teach something. Never just "incorrect." Each wrong answer should be a plausible misunderstanding with an explanation of why it's close but not right.

**FR sampleAnswer:** Not a correct answer. A debrief — what the exercise was designed to surface, common patterns in responses, why the exercise matters.

**Last step of last sequence:** Always ends pointing to the next course in the series. E.g., "The examination continues with saḷāyatana — the six sense bases..."

**DO series structure:** Each course examines one link from 6 angles (6 sequences). The angles vary per link but follow a general pattern: what the link is, how it works mechanically, its relationship to adjacent links, what it looks like in lived experience, how practice engages it, its role in the chain as a whole.

## Token Efficiency Rules for Claude

### Session Start Protocol

1. Read OPERATIONS.md. Do not search past conversations.
2. If Jesse provides a GitHub PAT, set the remote immediately. Do not ask for it later.
3. If content authoring is the task, start writing. Do not re-audit the repo, re-read the import script, or re-check the validation schemas.
4. If a file needs to be pushed, push it in the same turn it's created. Confirm the push. Give Jesse the import command. Done.

### During Content Authoring

1. **Do not scan conversation history to reconstruct project state.** This document is the state. If something isn't here, ask Jesse.
2. **Do not re-read the import script, validation schemas, or app routing every session.** The formats are documented above. If the schemas change, update this document.
3. **Do not write content exploratorily.** Know the exact format, write to it, validate, push. One pass.
4. **When writing content:** the bulk of tokens should go to content authoring, not to infrastructure discovery. The infrastructure is settled.
5. **When a file is created:** commit and push in the same turn. Do not leave uncommitted files. The Nāmarūpa incident (written but never pushed) must not repeat.
6. **When giving Jesse commands:** give the exact command, ready to paste. No preamble about what it does unless he asks. He knows the workflow.
7. **When something fails:** explain the error in one sentence, give the fix. Do not re-explain the architecture.
8. **Do not update deploy-all.sh for each new course.** It served its purpose for the initial bulk import. New courses are imported individually.

## Naming Conventions

- **DO course files:** `do-course-[N]-[pali-term].json` (e.g., `do-course-5-salayatana.json`)
- **FNT course files:** `course-[N]-[slug].json` (numbering is legacy, doesn't affect UI)
- **Reasoning course files:** `course-[N]-[slug].json`
- **Course slugs:** lowercase, hyphenated Pāli term (e.g., `salayatana`, `namarupa`)
- **Sequence slugs:** lowercase, hyphenated English (e.g., `the-whole-creature`, `the-mutual-loop`)
- **Commit messages:** plain language describing what was added (e.g., "Dependent Origination Course 4: Nāmarūpa - 6 sequences, 48 steps")

## What's Next

The immediate content work is completing the Dependent Origination series: 9 courses remaining (Saḷāyatana through The Whole Chain). Each is 6 sequences × 8 steps = 48 steps. Total remaining: ~432 steps.

## Quick Validation Command

After creating a content file, run this to verify structure:

```bash
python3 -c "
import json,sys
with open(sys.argv[1]) as f: d=json.load(f)
seqs=d['sequences']
total=sum(len(s['steps']) for s in seqs)
expected=['INSTRUCTION','INSTRUCTION','MULTIPLE_CHOICE','INSTRUCTION','MULTIPLE_CHOICE','INSTRUCTION','FREE_RESPONSE','INSTRUCTION']
errors=[]
for s in seqs:
    types=[st['type'] for st in s['steps']]
    if types!=expected: errors.append(f'{s[\"slug\"]}: {types}')
    for st in s['steps']:
        if st['type']=='MULTIPLE_CHOICE':
            opts=st['content']['options']
            if len(opts)!=3: errors.append(f'{s[\"slug\"]}: MC has {len(opts)} options')
            if sum(1 for o in opts if o['isCorrect'])!=1: errors.append(f'{s[\"slug\"]}: MC correct count wrong')
print(f'{d[\"title\"]}: {len(seqs)} seqs, {total} steps, category={d.get(\"category\",\"MISSING\")}')
if errors:
    for e in errors: print(f'  ERROR: {e}')
else:
    print('  All checks passed.')
" content/[filename].json
```
