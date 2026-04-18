# Reasons — Complete Project Reference

Last verified against repo: April 18, 2026

---

## What This Is

A web-based learning platform at **public-reasons.vercel.app** teaching practical reasoning, rhetorical analysis, and Buddhist contemplative practice. Two distinct pedagogical registers, both live:

**Adversarial register** (Practical Reasoning + structured Buddhist courses): learners are "players being tricked" whose job is to catch manipulation. Feedback language: "You saw through it" / "It got you. Here's how." Step rhythm: INSTRUCTION → INSTRUCTION → MC → INSTRUCTION → MC → INSTRUCTION → FREE_RESPONSE → INSTRUCTION.

**Contemplative register** (Slow Reading): sustained prose passages followed by one articulation prompt per movement. No multiple choice. Written to be read slowly and returned to. Voice modeled on William James — informed, direct, addressed to a near-equal, never performing depth.

**Six content branches:**
- Practical Reasoning — critical thinking, rhetoric, cognitive biases
- Four Noble Truths — the Buddhist diagnostic framework
- Dependent Origination — the twelve-link chain
- Modes of Conditionality (Paccaya) — how conditioning operates
- The Gradual Training — Hillside Hermitage / Ñāṇavīra Thera interpretation of the anupubbasikkhā
- Slow Reading — the same stages as the Gradual Training, in the contemplative register

**Owner-locked:** Only psilosophicc@gmail.com can access protected routes. All other authenticated users are redirected to `/private`.

---

## Infrastructure

| Component | Detail |
|-----------|--------|
| **Repo** | github.com/jbeck1689/Reasons (old URL jbeck1689/Public-Reasons still redirects) |
| **Stack** | Next.js 14.2.35, TypeScript, Prisma 5, NextAuth v4, Tailwind 3, Zod 4.3.6, Zustand, next-themes 0.4.6 |
| **Database** | Neon PostgreSQL (free tier). Connection: `?sslmode=require`, no `channel_binding` |
| **Deployment** | Vercel. Project ID: `prj_LdfeEuErkgSQ3K89460JZmmsQQap` |
| **Dev environment** | GitHub Codespaces |
| **GCP** | Fully abandoned. Do not reference Cloud Run, Cloud SQL, Docker, or cloudbuild |

### Version Pins
- **Prisma 5** (not 7 — breaking changes)
- **NextAuth v4** (not v5 — extended beta instability)
- **Zod 4.3.6** (project uses Zod 4, not 3)
- **tsx over ts-node** (Next.js `moduleResolution: "bundler"` conflicts with ts-node)
- **next-themes 0.4.6** (dark/light theme switching via CSS class strategy)

### Vercel Deployment Notes
- `prisma generate &&` must precede `next build` in the build script
- `output: "standalone"` is NOT used
- CSP requires `'unsafe-inline'` in `script-src` (Next.js hydration requirement)
- DATABASE_URL must NOT include `channel_binding=require`

### DATABASE_URL
Stored as a GitHub Codespaces secret (account-level, scoped to the Reasons repo). Loads automatically in new Codespace sessions. If it fails to load, verify the secret was created with repo access granted and that the Codespace is freshly created (not reopened from before the secret was added). Do not paste the URL into conversation.

---

## Design System

### Theme Architecture
All colors driven by CSS custom properties in `globals.css`, referenced through Tailwind via `tailwind.config.ts`. Two themes, switchable via sun/moon toggle in the dashboard header.

**Dark mode (default):** Deep oceanic blue-black (`#0f1419` base), teal/sea-glass accents (`#2a9485` → `#5ccdb8`). Heading text-shadow glow, teal radial gradient under header, progress bar glow.

**Light mode:** Matte cream/linen (`#f5f1eb` base), deep teal accents (`#166b60` → `#1a7a6e`). Warm, editorial feel. Same structural effects, tuned lighter.

### Effects
- 300ms smooth theme transition on all color properties
- `animate-fade-in` — content slides up on page load
- `card-hover` — cards lift 1px with teal shadow halo on hover
- `header-glow` — subtle teal radial gradient beneath nav
- `progress-glow` — progress bar radiates softly
- `heading-glow` — dark-mode headings get faint teal text-shadow
- `blockquote-border` — gradient border from teal to deep teal
- Buttons: `hover:shadow-lg hover:shadow-accent-600/20`
- All cards: `rounded-xl`, buttons/inputs: `rounded-lg`
- Scrollbar: 6px, transparent track

### Typography
- Lora serif for content (`--font-lora`)
- DM Sans for UI chrome (`--font-dm-sans`)
- Both via `next/font/google`

---

## What Claude Can and Cannot Do

**Claude can:** Write content JSON, commit/push to GitHub (with PAT), validate content programmatically, produce downloadable files, modify code.

**Claude cannot:** Connect to Neon, access the Codespace, run imports against the live database, trigger Vercel deploys via API.

**Workflow:** Claude writes and pushes content/code. Jesse runs imports from Codespaces. Content imports go live immediately (no Vercel redeploy). Code changes trigger Vercel auto-build on push.

**GitHub auth:** Classic PAT with `repo` scope. Set remote: `git remote set-url origin https://jbeck1689:[TOKEN]@github.com/jbeck1689/Public-Reasons.git`. Revoke PAT after each session in which it is used.

---

## Content Architecture

### Categories

Six categories, stored in `Course.category` (free-text String field, accepts any value):

| Category | Courses | Seqs/course | Steps/seq | Step rhythm | Total Steps |
|----------|---------|-------------|-----------|-------------|-------------|
| `reasoning` | 6 | 8 | 8 | Standard adversarial | 381* |
| `four-noble-truths` | 4 | 6 | 8 | Standard adversarial | 192 |
| `dependent-origination` | 13 | 6 | 8 | Standard adversarial | 624 |
| `paccaya` | 9 | 6 | 8 | Standard adversarial | 432 |
| `gradual-training` | 6 | 6 | 8 | Standard adversarial | 288 |
| `slow-reading` | 6 | 6 | 2 | Contemplative | 72 |
| **TOTAL** | **44** | **276** | | | **1,989** |

*Reasoning courses have legacy rhythm variations in early courses — see Known Issues.

### Step Rhythm — Standard Adversarial (all categories except slow-reading)
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

### Step Rhythm — Contemplative (slow-reading only)
```
1. INSTRUCTION  (sustained prose, 700–1,200 words)
2. FREE_RESPONSE  (one articulation prompt)
```
No multiple choice. Length determined by content, not template. Each sequence is called a "movement."

### Navigation Hierarchy
```
/home (post-login landing)
├── Practical Reasoning → /courses?topic=reasoning
└── Buddhist Studies → /buddhist-studies
    ├── Four Noble Truths → /courses?topic=four-noble-truths
    ├── Dependent Origination → /courses?topic=dependent-origination
    ├── Modes of Conditionality → /courses?topic=paccaya
    ├── The Gradual Training → /courses?topic=gradual-training
    └── Slow Reading → /courses?topic=slow-reading
```

---

## Content Inventory (all on GitHub)

### Practical Reasoning (category: reasoning)

| File | Title | Seqs | Steps |
|------|-------|------|-------|
| course-1-dont-get-tricked.json | Don't Get Tricked — Spotting Bad Arguments | 8 | 65* |
| course-2-rhetorical-devices.json | Rhetorical Devices — How Language Acts on People | 8 | 64 |
| course-2-think-before-you-decide.json | Think Before You Decide — Reasoning Under Uncertainty | 8 | 64 |
| course-3-build-your-case.json | Build Your Case — Constructing Sound Arguments | 8 | 60* |
| course-5-read-the-room.json | Read the Room — Social and Emotional Reasoning | 8 | 64 |
| course-6-numbers-dont-lie.json | Numbers Don't Lie (But People Do) | 8 | 64 |

### Four Noble Truths (category: four-noble-truths)

| File | Title | Seqs | Steps |
|------|-------|------|-------|
| course-7-something-is-off.json | Something Is Off — Understanding Suffering | 6 | 48 |
| course-8-the-engine.json | The Engine — The Mechanics of Craving | 6 | 48 |
| course-9-the-clearing.json | The Clearing — When the Engine Stops | 6 | 48 |
| course-10-the-practice.json | The Practice — Walking the Path | 6 | 48 |

### Dependent Origination (category: dependent-origination)

| File | Title | Sort | Seqs | Steps |
|------|-------|------|------|-------|
| do-course-1-avijja.json | Ignorance — Avijjā | 1 | 6 | 48 |
| do-course-2-sankhara.json | Formations — Saṅkhāra | 2 | 6 | 48 |
| do-course-3-vinnana.json | Consciousness — Viññāṇa | 3 | 6 | 48 |
| do-course-4-namarupa.json | Name-and-Form — Nāmarūpa | 4 | 6 | 48 |
| do-course-5-salayatana.json | Six Sense Bases — Saḷāyatana | 5 | 6 | 48 |
| do-course-6-phassa.json | Contact — Phassa | 6 | 6 | 48 |
| do-course-7-vedana.json | Feeling — Vedanā | 7 | 6 | 48 |
| do-course-8-tanha.json | Craving — Taṇhā | 8 | 6 | 48 |
| do-course-9-upadana.json | Clinging — Upādāna | 9 | 6 | 48 |
| do-course-10-bhava.json | Becoming — Bhava | 10 | 6 | 48 |
| do-course-11-jati.json | Birth — Jāti | 11 | 6 | 48 |
| do-course-12-jaramarana.json | Aging and Death — Jarāmaraṇa | 12 | 6 | 48 |
| do-course-13-whole-chain.json | The Whole Chain — Paṭiccasamuppāda | 13 | 6 | 48 |

### Modes of Conditionality (category: paccaya)

| File | Title | Sort | Seqs | Steps |
|------|-------|------|------|-------|
| paccaya-course-1-hetu-arammana.json | Root and Object — Hetu & Ārammaṇa | 1 | 6 | 48 |
| paccaya-course-2-anantara-samanantara.json | The Immediate Next — Anantara & Samanantara | 2 | 6 | 48 |
| paccaya-course-3-sahajata-annamanna.json | Arising Together — Sahajāta & Aññamañña | 3 | 6 | 48 |
| paccaya-course-4-nissaya-upanissaya.json | Ground and Catalyst — Nissaya & Upanissaya | 4 | 6 | 48 |
| paccaya-course-5-purejata-pacchajata.json | Before and After — Purejāta & Pacchājāta | 5 | 6 | 48 |
| paccaya-course-6-kamma-vipaka.json | Action and Fruit — Kamma & Vipāka | 6 | 6 | 48 |
| paccaya-course-7-ahara-indriya.json | What Sustains and What Governs — Āhāra & Indriya | 7 | 6 | 48 |
| paccaya-course-8-atthi-natthi.json | Being and Not-Being — Atthi/Natthi & Vigata/Avigata | 8 | 6 | 48 |
| paccaya-course-9-synthesis.json | The Web of Conditions — Paccaya | 9 | 6 | 48 |

### The Gradual Training (category: gradual-training)

| File | Title | Sort | Seqs | Steps |
|------|-------|------|------|-------|
| gt-course-1-pabbajja.json | Going Forth — Pabbajjā | 1 | 6 | 48 |
| gt-course-2-sila.json | Virtue as Foundation — Sīla | 2 | 6 | 48 |
| gt-course-3-indriyasamvara.json | Guarding the Sense Doors — Indriyasaṃvara | 3 | 6 | 48 |
| gt-course-4-sati-khanti.json | Mindfulness and Endurance — Sati & Khanti | 4 | 6 | 48 |
| gt-course-5-withdrawal-jhana.json | Withdrawal and Jhāna | 5 | 6 | 48 |
| gt-course-6-seeing-things.json | Seeing Things as They Are | 6 | 6 | 48 |

### Slow Reading (category: slow-reading)

Same six stages as the Gradual Training, in the contemplative prose register. Each course: 6 movements × 2 steps (INSTRUCTION + FREE_RESPONSE). No MC. Prose lengths 700–1,200 words per movement.

| File | Title | Sort | Seqs | Steps | Words |
|------|-------|------|------|-------|-------|
| sr-course-1-into-the-open.json | Into the Open — Pabbajjā | 1 | 6 | 12 | ~5,540 |
| sr-course-2-holding-still.json | Holding Still — Sīla | 2 | 6 | 12 | ~4,640 |
| sr-course-3-at-the-door.json | At the Door — Indriyasaṃvara | 3 | 6 | 12 | ~4,390 |
| sr-course-4-bearing-with.json | Bearing With — Sati & Khanti | 4 | 6 | 12 | ~3,860 |
| sr-course-5-the-quiet.json | The Quiet — Withdrawal & Jhāna | 5 | 6 | 12 | ~3,650 |
| sr-course-6-what-was-always-there.json | What Was Always There — Yathābhūtañāṇadassana | 6 | 6 | 12 | ~3,830 |

---

## Content Import Workflow

```bash
# In Codespaces (DATABASE_URL loaded automatically via Codespaces secret):
git pull origin main
npx tsx scripts/import-content.ts content/[filename].json
```

The import script uses upsert — safe to re-run. Content goes live immediately, no Vercel redeploy needed.

**deploy-all.sh** is stale (covers through DO course 3 only). Always import individually.

### Pending Imports (as of April 18, 2026)

Import status of the following is unconfirmed — verify with Jesse before assuming they are live:

```bash
# Paccaya (9 courses):
npx tsx scripts/import-content.ts content/paccaya-course-1-hetu-arammana.json
npx tsx scripts/import-content.ts content/paccaya-course-2-anantara-samanantara.json
npx tsx scripts/import-content.ts content/paccaya-course-3-sahajata-annamanna.json
npx tsx scripts/import-content.ts content/paccaya-course-4-nissaya-upanissaya.json
npx tsx scripts/import-content.ts content/paccaya-course-5-purejata-pacchajata.json
npx tsx scripts/import-content.ts content/paccaya-course-6-kamma-vipaka.json
npx tsx scripts/import-content.ts content/paccaya-course-7-ahara-indriya.json
npx tsx scripts/import-content.ts content/paccaya-course-8-atthi-natthi.json
npx tsx scripts/import-content.ts content/paccaya-course-9-synthesis.json

# Gradual Training (6 courses):
npx tsx scripts/import-content.ts content/gt-course-1-pabbajja.json
npx tsx scripts/import-content.ts content/gt-course-2-sila.json
npx tsx scripts/import-content.ts content/gt-course-3-indriyasamvara.json
npx tsx scripts/import-content.ts content/gt-course-4-sati-khanti.json
npx tsx scripts/import-content.ts content/gt-course-5-withdrawal-jhana.json
npx tsx scripts/import-content.ts content/gt-course-6-seeing-things.json

# Slow Reading (6 courses — new, likely not yet imported):
npx tsx scripts/import-content.ts content/sr-course-1-into-the-open.json
npx tsx scripts/import-content.ts content/sr-course-2-holding-still.json
npx tsx scripts/import-content.ts content/sr-course-3-at-the-door.json
npx tsx scripts/import-content.ts content/sr-course-4-bearing-with.json
npx tsx scripts/import-content.ts content/sr-course-5-the-quiet.json
npx tsx scripts/import-content.ts content/sr-course-6-what-was-always-there.json
```

---

## Content JSON Schema

### Standard Adversarial (reasoning, four-noble-truths, dependent-origination, paccaya, gradual-training)

```json
{
  "title": "Course Title",
  "slug": "lowercase-hyphenated",
  "description": "2-3 sentences.",
  "category": "gradual-training",
  "sortOrder": 1,
  "published": true,
  "sequences": [
    {
      "title": "Sequence Title",
      "slug": "sequence-slug",
      "description": "1-2 sentences.",
      "sortOrder": 1,
      "published": true,
      "steps": [
        { "type": "INSTRUCTION", "sortOrder": 1, "content": { "body": "Markdown text." } },
        { "type": "MULTIPLE_CHOICE", "sortOrder": 3, "content": {
            "prompt": "Question text.",
            "options": [
              { "id": "a", "text": "...", "isCorrect": false, "explanation": "..." },
              { "id": "b", "text": "...", "isCorrect": true, "explanation": "..." },
              { "id": "c", "text": "...", "isCorrect": false, "explanation": "..." }
            ],
            "shuffleOptions": false
          }
        },
        { "type": "FREE_RESPONSE", "sortOrder": 7, "content": {
            "prompt": "Open question.",
            "sampleAnswer": "Debrief, not a correct answer."
          }
        }
      ]
    }
  ]
}
```

### Contemplative (slow-reading)

```json
{
  "title": "Course Title — Pāli Term",
  "slug": "lowercase-hyphenated",
  "description": "2-3 sentences.",
  "category": "slow-reading",
  "sortOrder": 1,
  "published": true,
  "sequences": [
    {
      "title": "Movement Title",
      "slug": "movement-slug",
      "description": "1-2 sentences.",
      "sortOrder": 1,
      "published": true,
      "steps": [
        { "type": "INSTRUCTION", "sortOrder": 1, "content": { "body": "Sustained prose, 700-1200 words." } },
        { "type": "FREE_RESPONSE", "sortOrder": 2, "content": {
            "prompt": "One articulation prompt.",
            "sampleAnswer": "Orientation for the reader, not a correct answer."
          }
        }
      ]
    }
  ]
}
```

**Validation rules (standard):** Every MC has exactly 3 options (IDs "a","b","c"), exactly one correct. `shuffleOptions` always false. sortOrders 1-indexed, sequential.

**Validation rules (contemplative):** Exactly 2 steps per sequence: INSTRUCTION then FREE_RESPONSE. sortOrders 1, 2. No MC.

---

## Content Authoring Conventions

### Reasoning Courses
- Adversarial framing: learners catch tricks, not study textbooks
- Feedback: "You saw through it" / "It got you. Here's how."
- Wrong answer explanations teach something, never just "incorrect"
- ~20% of MC questions designed as traps

### Buddhist Studies — Standard Register (FNT, DO, Paccaya, Gradual Training)
- Serious but approachable. No mysticism, no devotional language
- Bhikkhu Bodhi translations as baseline. Ñāṇavīra Thera's structural/present-moment readings for DO and Paccaya
- Pāli diacriticals: ā, ī, ū, ṃ, ṇ, ṭ, ḍ, ñ, ḷ
- Course titles: "English Translation — Pāli Term"
- Last step of last sequence points to next course in series

### Slow Reading — Contemplative Register
- Voice: William James with Emerson's economy. Informed, direct, addressed to a near-equal. Never performs depth.
- Concrete before abstract, every time. Introduce the Pāli term only after the English phenomenon is clearly in view.
- Interpretive framework: Hillside Hermitage (Nyanamoli Thero) + Ñāṇavīra Thera. Anti-commentarial. Peripheral awareness over focused attention. Jhāna as result of withdrawal, not concentration technique.
- Each sequence ("movement") is one sustained prose passage followed by one articulation prompt.
- Articulation prompts are real questions the reader cannot answer without working — not comprehension checks.
- sampleAnswer is orientation for the reader, not evaluation of correctness.
- Pāli used sparingly, especially in early courses. Increases in density in later courses where finer vocabulary is required.
- Do not draw on the author's personal spiritual experiences or conversations as source material.

---

## Security

### Owner Lock
Middleware (`src/middleware.ts`): after auth check, verifies `token.email?.toLowerCase() === "psilosophicc@gmail.com"`. Non-owner users redirected to `/private` page.

### Security Headers
All 7 present in `next.config.mjs`: CSP, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, HSTS.

### Rate Limiting
In-memory (middleware): global 100/min per IP on API routes.

### Auth
NextAuth v4, JWT sessions, bcrypt cost 12, Prisma adapter, credentials provider.

---

## Build History

### Phases 0-4 (Complete)
Foundation, auth, content pipeline, security hardening, Vercel deployment.

### Phase 5 — Content (Ongoing)
- Reasoning: 6 courses complete
- Four Noble Truths: 4 courses complete
- Dependent Origination: 13 courses complete
- Paccaya: 9 courses complete
- Gradual Training: 6 courses complete
- Slow Reading: 6 courses complete
- **Total: 44 courses, 276 sequences, 1,989 steps, ~26,000 words of contemplative prose**

### Pedagogical Redesign (April 18, 2026)
- Slow Reading category created as a second pedagogical register
- New format: sustained prose movements + single articulation prompt. No MC.
- Voice established: William James / Emerson economy. Contemplative but unsentimental.
- Buddhist Studies page updated with Slow Reading card (fifth card, sibling to Gradual Training)
- Three source files updated: buddhist-studies/page.tsx, courses/page.tsx, courses/[courseId]/page.tsx

---

## Known Legacy Issues (cosmetic, do not fix)

- **Course 1 (Don't Get Tricked):** Non-standard rhythm, ~9 steps/sequence.
- **Course 3 (Build Your Case):** Four sequences have 7 steps. 60 total instead of 64.
- **Course 10 (The Practice):** One sequence has non-standard rhythm.
- **All reasoning courses:** Missing `category` field in JSON. Import defaults to "reasoning".
- **deploy-all.sh:** Stale — covers through DO course 3 only.

---

## Key Decisions Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Adversarial framing as core pedagogy | "Catch the trick" > "study the textbook" | Mar 7 |
| Skip admin UI, use import pipeline | Faster, simpler, no new attack surface | Mar 8 |
| Vercel over GCP/Cloud Run | GCP billing bugs made deployment impossible | Mar 9 |
| 13-course DO series | Each link deserves its own course | Mar 25 |
| 9-course Paccaya series (reduced from 13) | Content grounds, scope management | Apr 15 |
| Teal/oceanic design system | Editorial, modern, refined feel | Apr 15 |
| Owner lock via middleware | Private development, no public access yet | Apr 15 |
| Gradual Training — Hillside Hermitage interpretation | Philosophically rigorous, demystified | Apr 15 |
| `category` as free-text String (not enum) | New categories work without schema migration | Apr 15 |
| Slow Reading as a second pedagogical register | MC ill-suited to contemplative material; voice and rhythm redesigned | Apr 18 |
| Slow Reading as sibling card to Gradual Training | Two registers, same subject matter, clearly separated | Apr 18 |
| DATABASE_URL stored as Codespaces secret | Eliminates repeated export-per-session; credential not in repo or chat | Apr 18 |

---

## Deferred / Future Work

- **App name:** Undecided. Currently "Reasons" in header, "Public Reasons" on landing page
- **LLM-powered free-response feedback:** Architecture stubbed (`src/lib/services/llmEvaluator.ts`), implementation deferred. Discussed as a future enhancement for Slow Reading articulation prompts.
- **Completion tracking redesign:** Current progress bar may not be appropriate for Slow Reading content whose ethic resists "finishing." Deferred — no action yet.
- **Enterprise ethics training:** Raised as potential direction, explicitly deferred
- **Classical language study (Pāli):** Noted as later content expansion
- **Custom domain + SSL:** Optional, after everything else
- **Billing/Stripe integration:** Phase 6, tied to LLM integration
- **Square roots curriculum:** Developed as hybrid document, not yet adapted for platform format

---

## Token Efficiency Rules for Claude

0. **At the start of every session, before any work, read `REASONS-PROJECT-REFERENCE.md` from the repo.** Clone the repo if not already present (`git clone https://github.com/jbeck1689/Public-Reasons.git /tmp/Reasons`), then read the file. This is the state. Do not proceed from memory or chat history.
1. This document is the state. Don't scan chat history unless explicitly asked.
2. Don't re-read import scripts, validation schemas, or routing each session.
3. When writing content: know the format, write to it, validate, push. One pass.
4. When a file is created: commit and push in the same turn.
5. When giving Jesse commands: exact command, ready to paste. No preamble.
6. Don't update deploy-all.sh for each new course. Individual imports.
7. Slow Reading uses a different validation check than the standard courses — see below.
8. Do not draw on personal conversations or experiences in Slow Reading authorship.
9. At the end of any session where something meaningful changed, update this file and push it.

---

## Quick Validation Commands

### Standard adversarial courses

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

### Slow Reading courses

```bash
python3 -c "
import json,sys
with open(sys.argv[1]) as f: d=json.load(f)
seqs=d['sequences']
total=sum(len(s['steps']) for s in seqs)
errors=[]
for s in seqs:
    types=[st['type'] for st in s['steps']]
    if types != ['INSTRUCTION','FREE_RESPONSE']:
        errors.append(f'{s[\"slug\"]}: {types}')
    sortOrders=[st['sortOrder'] for st in s['steps']]
    if sortOrders != list(range(1, len(sortOrders)+1)):
        errors.append(f'{s[\"slug\"]}: sortOrders {sortOrders}')
total_words=sum(len(st['content']['body'].split()) for s in seqs for st in s['steps'] if st['type']=='INSTRUCTION')
print(f'{d[\"title\"]}: {len(seqs)} seqs, {total} steps, {total_words} words, category={d.get(\"category\",\"MISSING\")}')
if errors:
    for e in errors: print(f'  ERROR: {e}')
else:
    print('  All checks passed.')
" content/[filename].json
```
