import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { globalLimiter } from "@/lib/utils/rate-limit";

// Routes that require authentication
const protectedPaths = ["/courses", "/learn", "/progress", "/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── GLOBAL RATE LIMIT (API routes only) ───
  if (pathname.startsWith("/api/")) {
    // Vercel (and most proxies) set x-forwarded-for; request.ip is not
    // available on NextRequest in middleware, so don't rely on it.
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const rateCheck = await globalLimiter.check(ip);
    if (!rateCheck.allowed) {
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
