# ─── Stage 1: DEPS ───
# Install all dependencies (including dev) needed for the build.
# Think of this as setting up the workshop with all the tools.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: BUILDER ───
# Build the Next.js app using the standalone output mode.
# This is the actual construction — compiling TypeScript,
# bundling pages, generating the Prisma client.
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Stage 3: RUNNER ───
# The final, minimal image. Only contains what's needed to run.
# No source code, no dev dependencies, no build tools.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Run as non-root user. If an attacker somehow gets code execution
# inside the container, they can't escalate to root.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the built output — not the full source tree
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma needs its generated client at runtime for database queries
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

# Cloud Run expects the app to listen on the PORT env var (default 8080)
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
