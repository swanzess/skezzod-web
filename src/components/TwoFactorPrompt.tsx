"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/** The "enter your 6-digit code" step shown after primary sign-in when the
 *  account has 2FA on. Shared by the sign-in and sign-up pages (a sign-up
 *  page's Google button can still land on an existing 2FA-protected
 *  account). `onDone` fires once the code is accepted and the session is
 *  fully established. */
export function TwoFactorPrompt({ onDone }: { onDone: () => void }) {
  const { completeTwoFactor, cancelTwoFactor } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await completeTwoFactor(code.trim());
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-nh-navy">Enter your code</h1>
      <p className="mt-2 text-sm text-nh-charcoal/60">
        Open your authenticator app and enter the 6-digit code for Neri Haven — or one of your backup codes.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <input
          required
          autoFocus
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-xl border border-nh-lavender px-4 py-3 text-center text-lg tracking-[0.3em] focus:border-nh-navy focus:outline-none"
          placeholder="000000"
          maxLength={12}
        />

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy || code.trim().length === 0}
          className="mt-1 rounded-full bg-nh-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
      </form>

      <button
        onClick={() => cancelTwoFactor()}
        className="mt-6 text-center text-sm font-semibold text-nh-charcoal/60 hover:text-nh-navy"
      >
        Use a different account
      </button>
    </div>
  );
}
