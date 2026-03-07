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
        // Generic message — never reveal whether the email exists
        setError("Invalid email or password.");
        return;
      }

      // Success — go to courses
      router.push("/courses");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <div className="text-3xl font-light text-teal-400 mb-4">◆</div>
        <h1 className="text-2xl font-semibold text-stone-100">Sign in</h1>
        <p className="text-sm text-stone-500 mt-2">
          Welcome back. Pick up where you left off.
        </p>
      </div>

      {justRegistered && (
        <div className="p-3 rounded border border-teal-600/30 bg-teal-950/20 text-sm text-teal-400">
          Account created. Sign in to get started.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded border border-red-500/30 bg-red-950/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm text-stone-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded text-stone-200 placeholder-stone-600 focus:border-teal-600 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-stone-400 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded text-stone-200 placeholder-stone-600 focus:border-teal-600 focus:outline-none"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 font-medium rounded transition-colors ${
            loading
              ? "bg-stone-700 text-stone-500 cursor-not-allowed"
              : "bg-teal-700 hover:bg-teal-600 text-stone-100"
          }`}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-teal-500 hover:text-teal-400">
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
