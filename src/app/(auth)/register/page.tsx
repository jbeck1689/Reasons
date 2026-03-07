"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Success — send them to login
      router.push("/login?registered=true");
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
        <h1 className="text-2xl font-semibold text-stone-100">
          Create an account
        </h1>
        <p className="text-sm text-stone-500 mt-2">
          Start learning to see through bad arguments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded border border-red-500/30 bg-red-950/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm text-stone-400 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded text-stone-200 placeholder-stone-600 focus:border-teal-600 focus:outline-none"
            placeholder="Your name"
          />
        </div>

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
            minLength={8}
            className="w-full px-4 py-2.5 bg-stone-900 border border-stone-700 rounded text-stone-200 placeholder-stone-600 focus:border-teal-600 focus:outline-none"
            placeholder="At least 8 characters"
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-500 hover:text-teal-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}
