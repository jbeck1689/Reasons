/**
 * Rate limiting with a fixed window per key (IP, email, userId, …).
 *
 * Backend selection:
 * - If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, counters
 *   live in Upstash Redis. This is the correct backend on serverless platforms
 *   (Vercel, Cloud Run with min-instances=0), where each instance has isolated
 *   memory and an in-memory map cannot enforce a global limit.
 * - Otherwise it falls back to an in-memory map and logs a one-time warning.
 *   That fallback is best-effort only (per instance) — fine for local dev,
 *   not a real defense in production.
 *
 * If Redis is configured but unreachable, checks fail OPEN (allow the request)
 * and log the error — a Redis outage should not lock every user out.
 */

import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp in ms
}

interface RateLimiterConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

// ─── Backend selection ───

let redisClient: Redis | null = null;
let backendResolved = false;
let fallbackWarned = false;

function getRedis(): Redis | null {
  if (!backendResolved) {
    backendResolved = true;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      redisClient = new Redis({ url, token });
    }
  }
  return redisClient;
}

function warnInMemoryFallback(): void {
  if (!fallbackWarned) {
    fallbackWarned = true;
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — " +
        "using in-memory rate limiting (per server instance only; ineffective on serverless)."
    );
  }
}

// ─── In-memory fallback (fixed window) ───

const memoryStores = new Map<string, Map<string, RateLimitEntry>>();
let cleanupStarted = false;

function startMemoryCleanup(): void {
  if (cleanupStarted) return;
  cleanupStarted = true;
  // setInterval does not exist in the Edge runtime (middleware) — skip there.
  if (typeof setInterval === "undefined") return;
  setInterval(() => {
    const now = Date.now();
    memoryStores.forEach((store) => {
      store.forEach((entry, key) => {
        if (entry.resetAt < now) store.delete(key);
      });
    });
  }, 60_000);
}

function checkInMemory(
  store: Map<string, RateLimitEntry>,
  key: string,
  config: RateLimiterConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // No entry, or window expired — start a fresh window
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  entry.count += 1;
  if (entry.count > config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── Redis backend (fixed window via INCR + EXPIRE) ───

async function checkWithRedis(
  client: Redis,
  name: string,
  key: string,
  config: RateLimiterConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const redisKey = `ratelimit:${name}:${key}`;

  const count = await client.incr(redisKey);
  if (count === 1) {
    // First hit in this window — set the expiry
    await client.expire(redisKey, config.windowSeconds);
  }
  const ttl = await client.ttl(redisKey);

  return {
    allowed: count <= config.limit,
    remaining: Math.max(config.limit - count, 0),
    resetAt: now + Math.max(ttl, 0) * 1000,
  };
}

// ─── Public factory ───

export function createRateLimiter(name: string, config: RateLimiterConfig) {
  if (!memoryStores.has(name)) {
    memoryStores.set(name, new Map());
  }
  const store = memoryStores.get(name)!;
  startMemoryCleanup();

  return {
    async check(key: string): Promise<RateLimitResult> {
      const redis = getRedis();
      if (redis) {
        try {
          return await checkWithRedis(redis, name, key, config);
        } catch (err) {
          console.error("[rate-limit] Redis error — failing open:", err);
        }
      } else {
        warnInMemoryFallback();
      }
      return checkInMemory(store, key, config);
    },
  };
}

// ─── PRE-CONFIGURED LIMITERS ───

/** 100 requests/minute per IP on all API routes */
export const globalLimiter = createRateLimiter("global", {
  limit: 100,
  windowSeconds: 60,
});

/** 5 login attempts/minute per email */
export const loginLimiter = createRateLimiter("login", {
  limit: 5,
  windowSeconds: 60,
});

/** 10 registration attempts/hour per IP */
export const registerLimiter = createRateLimiter("register", {
  limit: 10,
  windowSeconds: 3600,
});

/** 30 step submissions/minute per user */
export const submissionLimiter = createRateLimiter("submission", {
  limit: 30,
  windowSeconds: 60,
});
