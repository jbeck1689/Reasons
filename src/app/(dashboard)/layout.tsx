"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {/* Header */}
      <header className="sticky top-0 bg-stone-950 border-b border-stone-800 z-20">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/courses"
              className="text-teal-400 font-medium text-sm flex items-center gap-2"
            >
              <span className="text-lg">◆</span>
              <span className="hidden sm:inline">Practical Reasoning</span>
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/courses"
                className="text-xs text-stone-500 hover:text-stone-300 uppercase tracking-wider"
              >
                Courses
              </Link>
              <Link
                href="/progress"
                className="text-xs text-stone-500 hover:text-stone-300 uppercase tracking-wider"
              >
                Progress
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <>
                <span className="text-xs text-stone-600">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs text-stone-500 hover:text-stone-300"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
