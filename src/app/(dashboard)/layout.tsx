"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-300">
      {/* Header */}
      <header className="sticky top-0 bg-surface-900/90 backdrop-blur-md border-b border-surface-700/30 z-20 header-glow relative">
        <div className="max-w-4xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/home"
              className="text-accent-400 font-medium text-sm flex items-center gap-2.5 group"
            >
              <span className="text-base opacity-80 group-hover:opacity-100 transition-opacity">◆</span>
              <span className="hidden sm:inline font-serif tracking-tight text-surface-200 group-hover:text-accent-300 transition-colors">
                Reasons
              </span>
            </Link>
            <nav className="flex gap-5">
              <Link
                href="/home"
                className="text-[11px] text-surface-500 hover:text-surface-200 uppercase tracking-[0.15em] transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/progress"
                className="text-[11px] text-surface-500 hover:text-surface-200 uppercase tracking-[0.15em] transition-colors"
              >
                Progress
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user && (
              <>
                <span className="text-[11px] text-surface-600 hidden sm:inline">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-[11px] text-surface-500 hover:text-surface-300 transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main id="main-content">{children}</main>
    </div>
  );
}
