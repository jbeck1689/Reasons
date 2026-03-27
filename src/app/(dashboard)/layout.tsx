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
      <header className="sticky top-0 bg-surface-900/95 backdrop-blur-sm border-b border-surface-700/50 z-20">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/home"
              className="text-accent-400 font-medium text-sm flex items-center gap-2"
            >
              <span className="text-lg">◆</span>
              <span className="hidden sm:inline font-serif tracking-tight">
                Public Reasons
              </span>
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/home"
                className="text-xs text-surface-500 hover:text-surface-200 uppercase tracking-wider transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/progress"
                className="text-xs text-surface-500 hover:text-surface-200 uppercase tracking-wider transition-colors"
              >
                Progress
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session?.user && (
              <>
                <span className="text-xs text-surface-600 hidden sm:inline">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
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
