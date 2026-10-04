# Reasons — Practical Reasoning

A web app for cultivating critical thinking: structured courses with sequences of interactive steps (instruction, multiple choice, free response, ordering, matching, rhetorical analysis, and more), progress tracking, and user accounts.

**Live:** https://public-reasons.vercel.app

## Stack

- **Next.js 14** (App Router) + React 18 + TypeScript + Tailwind CSS
- **PostgreSQL** (Neon) via **Prisma 5**
- **NextAuth v4** — credentials provider, bcrypt-hashed passwords, JWT sessions
- **Zod** validation, **next-themes** dark/light mode
- Deployed on **Vercel** (primary). A Docker image + Google Cloud Build → Cloud Run pipeline also exists for self-hosting.

## Quickstart

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL, NEXTAUTH_SECRET
npx prisma db push     # create tables (no migration history; see note below)
npm run db:seed        # seed a demo user + sample course
npm run dev            # http://localhost:3000
```

### Environment

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string (Neon) |
| `NEXTAUTH_SECRET` | yes | Session signing secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | yes | App URL (`http://localhost:3000` locally) |
| `UPSTASH_REDIS_REST_URL` | no | Enables shared rate limiting (see below) |
| `UPSTASH_REDIS_REST_TOKEN` | no | Enables shared rate limiting (see below) |

### Rate limiting

API routes are rate-limited (100 req/min/IP globally; stricter on login, registration, and submissions). The limiter in `src/lib/utils/rate-limit.ts` uses **Upstash Redis** when the two `UPSTASH_*` variables are set — which is the correct backend on serverless platforms like Vercel, where each instance has isolated memory. Without them it falls back to an in-memory limiter and logs a warning; that fallback is best-effort only (per-instance) and should not be relied on in production.

## Project structure

```
src/
  app/
    (auth)/          login, register
    (dashboard)/     home, courses, learn/[sequenceId], progress, buddhist-studies
    (admin)/         content management
    api/             auth, register, health, progress submit/complete
  components/learning/  step renderers (MultipleChoice, FreeResponse, Ordering, …)
  lib/
    auth.ts          NextAuth options (credentials + bcrypt cost 12)
    db.ts            Prisma client singleton
    services/llmEvaluator.ts   stub — contract for future LLM grading (not implemented)
    utils/rate-limit.ts        shared rate limiter (Redis or in-memory)
    validations/     zod schemas for auth + content import
  middleware.ts      auth protection + API rate limiting
content/             course JSON files (source of truth for curriculum)
prisma/
  schema.prisma      data model (Course → Sequence → Step, progress, responses)
  seed.ts            demo seed
scripts/
  import-content.ts  validate + upsert a course JSON: npx ts-node scripts/import-content.ts content/<file>.json
```

## Content authoring

Courses are authored as JSON in `content/` and imported with `scripts/import-content.ts`, which validates against the Zod schemas in `src/lib/validations/content.ts` and upserts (safe to re-run). See `content/test-import.json` for a minimal example. Course `category` is a Prisma enum (`Category`) — the JSON uses kebab-case values (`reasoning`, `dependent-origination`, `four-noble-truths`, `gradual-training`, `paccaya`, `slow-reading`), mapped to the enum in the import script.

> **DB note:** `prisma/migrations` is intentionally empty — the schema was applied with `prisma db push`. If you convert the `Category` enum (or any type change) against the existing database, run the `USING` cast manually first, e.g.:
>
> ```sql
> CREATE TYPE "Category" AS ENUM ('reasoning', 'dependent-origination', 'four-noble-truths', 'gradual-training', 'paccaya', 'slow-reading');
> ALTER TABLE "Course" ALTER COLUMN "category" TYPE "Category" USING "category"::"Category";
> ```

## Deploying

- **Vercel (current production):** connect the repo, set the env vars above, deploy. The `build` script runs `prisma generate` automatically.
- **Docker / Cloud Run:** `next.config.mjs` sets `output: "standalone"`; `Dockerfile` is a 3-stage build (deps → builder → non-root runner). `cloudbuild.yaml` builds, pushes to Artifact Registry, and deploys to Cloud Run on push to `main` (configure the `_REGION`/`_REPO_NAME`/`_SERVICE_NAME` substitutions and the `DATABASE_URL`/`NEXTAUTH_SECRET` secrets in the trigger).

Local infra: `docker-compose.yml` spins up Postgres 15 (and a Redis placeholder) for development.

## Docs

- `PROJECT-BRIEF.md` — what the app is and why
- `OPERATIONS.md` — operations log and deployment status
- `DEPLOYMENT.md` — deployment runbook
- `REASONS-PROJECT-REFERENCE.md` — full project reference (April 2026)

## License

MIT — see [LICENSE](LICENSE).
