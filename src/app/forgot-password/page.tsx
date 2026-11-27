"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authService.sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-nh-navy">Reset your password</h1>

      {sent ? (
        <p className="mt-6 rounded-xl bg-nh-lavender/30 p-4 text-sm text-nh-charcoal/80">
          If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-nh-charcoal/60">
            Enter the email on your account and we&apos;ll send a link to reset your password.
          </p>
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
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-full bg-nh-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-nh-charcoal/60">
        <Link href="/signin" className="font-semibold text-nh-navy">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
