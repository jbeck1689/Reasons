# Project Brief — Practical Reasoning & Language Learning App

**Last updated:** March 8, 2026
**Status:** Phase 4 files complete. GCP setup required before first deploy.
**Next action:** Follow DEPLOYMENT.md to set up GCP and trigger first deploy.

---

## What This Is

A web-based learning platform that teaches practical reasoning,
rhetorical analysis, and eventually language skills through
interactive, scenario-based sequences. Core design: adversarial
framing — the learner catches tricks, not studies textbooks.

## Phase 1 — Complete

- Registration and login (bcrypt cost 12, JWT sessions, Zod validation)
- Route protection middleware
- Course catalog and course detail pages
- Sequence player (INSTRUCTION, MULTIPLE_CHOICE, FREE_RESPONSE)
- Response submission and progress tracking APIs
- Auto-enrollment on sequence start
- Progress dashboard
- Security checkpoint passed
- Two sequences seeded: The Pressure Play, Rhetorical Devices

## Phase 2 — Complete

- Content import pipeline: `scripts/import-content.ts`
- Zod validation schemas for all 10 step types (Zod 4 compatible)
- Full Course 1: "Don't Get Tricked" — all 8 sequences, 64 steps
- Content production workflow established (LLM generates, developer QAs)
- Security checkpoint passed

## Phase 3 — Complete

### What was built

- **Security headers:** All 7 headers from spec §5.3 added to
  `next.config.mjs` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  X-XSS-Protection, Referrer-Policy, Permissions-Policy).
- **Standalone output:** `output: "standalone"` in next.config for
  Docker/Cloud Run deployment readiness.
- **Rate limiting:** In-memory sliding window rate limiter with four
  tiers: global API (100/min per IP in middleware), login (5/min per
  email in auth.ts), registration (10/hr per IP), submissions (30/min
  per user). Swap for Redis-backed limiter before production.
- **Enrollment verification:** Submit and complete routes now verify
  the user is enrolled in the course that owns the step.
- **Input validation:** Zod validation on submit payload with 10KB
  size limit on responses.
- **Structured logging:** Logger module with pino-compatible interface.
  JSON output with level/message/timestamp. Stack traces stripped in
  production. Drop-in replacement for pino when needed.
- **Accessibility:** ARIA progressbar on sequence progress, radiogroup
  semantics on multiple choice options, aria-live regions for feedback
  announcements, focus management on step navigation, skip-to-content
  link in root layout.
- **LLM evaluator stub:** `src/lib/services/llmEvaluator.ts` with full
  interface contract (EvaluationRequest, EvaluationResult, LlmConfig).
  Throws if called. Submit route checks `step.metadata.llmEnabled` and
  falls back gracefully.
- **LlmConfig schema:** Validation schema added to content.ts for
  step metadata including llmConfig, hints, difficulty, tags.
- **Security checkpoint passed.** All headers verified, rate limiting
  active on all critical endpoints, XSS surface audited (React JSX
  auto-escapes, no dangerouslySetInnerHTML), secrets clean.

### Files changed or added

- `next.config.mjs` — security headers + standalone output
- `src/middleware.ts` — rewritten with global rate limiting + auth
- `src/lib/auth.ts` — login rate limiting added
- `src/app/api/register/route.ts` — registration rate limiting
- `src/app/api/progress/[stepId]/submit/route.ts` — enrollment check,
  Zod validation, size limit, LLM-enabled check, structured logging
- `src/app/api/progress/[stepId]/complete/route.ts` — enrollment check,
  structured logging
- `src/lib/utils/rate-limit.ts` — new: in-memory rate limiter module
- `src/lib/utils/logger.ts` — new: structured logging module
- `src/lib/services/llmEvaluator.ts` — new: LLM evaluator stub
- `src/lib/validations/content.ts` — LlmConfig + StepMetadata schemas
- `src/components/learning/SequencePlayer.tsx` — ARIA + focus management
- `src/components/learning/MultipleChoiceStep.tsx` — radiogroup + aria-live
- `src/components/learning/FreeResponseStep.tsx` — aria-label + aria-live
- `src/app/layout.tsx` — skip-to-content link
- `src/app/(dashboard)/layout.tsx` — main-content id

## Phase 4 — Complete (files ready, GCP setup pending)

### What was built

- **Dockerfile:** Multi-stage build (deps → builder → runner). Runs as
  non-root user `nextjs`. Standalone output. ~100MB final image.
- **cloudbuild.yaml:** Automated CI/CD pipeline. Push to main triggers
  build → push to Artifact Registry → deploy to Cloud Run.
- **.dockerignore:** Excludes secrets, node_modules, .git, tests, docs.
- **DEPLOYMENT.md:** Step-by-step GCP setup guide with all commands.
- **Key decision: skip Cloud SQL and Redis.** Neon stays as production
  database. In-memory rate limiting for soft launch. Saves ~$25-60/month
  with zero tradeoffs at current scale.
- **Security checkpoint passed.** Non-root container, no secrets in
  image, database SSL via Neon default, Secret Manager for all env vars.

### What the developer needs to do

Follow DEPLOYMENT.md steps 1-8 in the GCP console. Estimated time:
30-45 minutes for first-time setup. After that, every push to main
auto-deploys.

## Key Decisions

- **Neon as production database.** Skipped Cloud SQL. No migration
  needed, SSL by default, free tier. Revisit if scale demands it.
- **Skip Redis for production.** In-memory rate limiting for soft launch.
- **Skip admin UI.** Import pipeline replaces it.
- **LLM as primary content engine.** Developer is learner/QA, not author.
- **Practical reasoning first.** Other domains come after Course 1.
- **In-memory rate limiting for dev.** Swap for Redis before production.
- **Zod 4 in use.** Project uses Zod 4.3.6.
- **tsx over ts-node.** Standalone scripts use `npx tsx`.
- **App name:** Still undecided.

## Infrastructure

- Code: github.com/jbeck1689/Public-Reasons
- Database: Neon PostgreSQL (free tier)
- Development: GitHub Codespaces

## Stack

Next.js 14+, TypeScript, PostgreSQL, Prisma, NextAuth v4, Tailwind,
Zustand, Zod 4. Google Cloud Run for deployment. Neon for database.

## What's NOT Built Yet

- GCP project setup and first deploy (developer task, see DEPLOYMENT.md)
- Custom domain + SSL (Phase 4, optional)
- Full content load and soft launch (Phase 5)
- LLM-powered feedback on free responses (Phase 6)

## Documents in This Project

| Document | Purpose |
|----------|---------|
| PROJECT-BRIEF.md | This file. Master summary. |
| learning-app-spec.md | Technical architecture, data model, API, security. |
| content-framework.md | Content strategy, courses, step patterns, tiers. |
| deployment-pipeline.md | Phased build plan, costs, LLM integration plan. |
| reasoning-prototype.jsx | Working prototype: The Pressure Play. |
| sequence-player-prototype.jsx | Working prototype: Rhetorical Devices. |
| PROJECT-INSTRUCTIONS.md | How Claude should work with the developer. |
| DEPLOYMENT.md | GCP setup guide, Cloud Run deployment steps. |
