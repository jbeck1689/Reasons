"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/courses");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="text-3xl font-light text-accent-400 mb-4 heading-glow">◆</div>
        <h1 className="text-2xl font-serif font-semibold text-surface-100 heading-glow">Sign in</h1>
        <p className="text-sm text-surface-500 mt-2">
          Welcome back. Pick up where you left off.
        </p>
      </div>

      {justRegistered && (
        <div className="p-3 rounded border border-accent-700/30 bg-accent-950/30 text-sm text-accent-300">
          Account created. Sign in to get started.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded border border-incorrect-border/30 bg-incorrect-bg text-sm text-incorrect-text">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm text-surface-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded text-surface-200 placeholder-surface-500 focus:border-accent-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-surface-400 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-surface-800 border border-surface-700 rounded text-surface-200 placeholder-surface-500 focus:border-accent-500 focus:outline-none"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 font-medium rounded-lg transition-all ${
            loading
              ? "bg-surface-700 text-surface-500 cursor-not-allowed"
              : "bg-accent-600 hover:bg-accent-500 text-surface-950"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-surface-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent-400 hover:text-accent-300">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
