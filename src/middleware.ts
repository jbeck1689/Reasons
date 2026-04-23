import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * In-memory rate limiter for the middleware layer.
 * Middleware runs in Edge runtime (separate memory from API routes in dev).
 * In production on Cloud Run, everything runs in one Node process.
 * Swap for Redis-backed limiter before production launch.
 */
const globalCounts = new Map<string, { count: number; resetAt: number }>();

function checkGlobalLimit(ip: string): boolean {
  const now = Date.now();
  const entry = globalCounts.get(ip);

  if (!entry || entry.resetAt < now) {
    globalCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  entry.count += 1;
  return entry.count <= 100; // 100 requests/minute per IP
}

// Clean up stale entries every minute
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    globalCounts.forEach((entry, key) => {
      if (entry.resetAt < now) globalCounts.delete(key);
    });
  }, 60_000);
}

// Routes that require authentication
const protectedPaths = ["/courses", "/learn", "/progress", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── GLOBAL RATE LIMIT (API routes only) ───
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.ip ??
      "unknown";

    if (!checkGlobalLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
  }

  // ─── AUTH PROTECTION ───
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/courses/:path*",
    "/learn/:path*",
    "/progress/:path*",
    "/admin/:path*",
    "/api/:path*",
  ],
};
