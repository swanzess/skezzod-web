"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-nh-navy">Welcome back</h1>
      <p className="mt-2 text-sm text-nh-charcoal/60">Sign in to check a message or manage your family.</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-nh-charcoal">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-nh-lavender px-4 py-2.5 font-normal focus:border-nh-navy focus:outline-none"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-nh-charcoal">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-nh-lavender px-4 py-2.5 font-normal focus:border-nh-navy focus:outline-none"
            placeholder="••••••••"
          />
        </label>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-semibold text-nh-navy">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-full bg-nh-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-nh-charcoal/60">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-nh-navy">
          Create a free account
        </Link>
      </p>
    </div>
  );
}
