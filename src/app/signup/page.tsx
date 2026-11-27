"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { billingService } from "@/lib/billing";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { TwoFactorPrompt } from "@/components/TwoFactorPrompt";
import { PlanId } from "@/lib/plans";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signUp, signInWithGoogle, twoFactorPending } = useAuth();
  const planParam = (params.get("plan") as PlanId | null) ?? "free";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function afterAuth() {
    if (planParam !== "free") {
      await billingService.startCheckout(planParam);
      return; // navigates away to Stripe
    }
    router.push("/dashboard");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await signUp(name.trim(), email.trim(), password, planParam);
      if (!result.twoFactorRequired) await afterAuth();
      else setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  async function onGoogleToken(idToken: string) {
    setError(null);
    setBusy(true);
    try {
      const result = await signInWithGoogle(idToken);
      if (!result.twoFactorRequired) await afterAuth();
      else setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (twoFactorPending) {
    return <TwoFactorPrompt onDone={() => void afterAuth()} />;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-nh-navy">Create your account</h1>
      <p className="mt-2 text-sm text-nh-charcoal/60">
        {planParam === "free"
          ? "Free forever — 5 checks a day, no credit card needed."
          : `Starting your ${planParam} plan — you'll set up payment next.`}
      </p>

      <div className="mt-8">
        <GoogleSignInButton text="signup_with" onIdToken={onGoogleToken} />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-nh-charcoal/40">
        <span className="h-px flex-1 bg-nh-lavender/70" />
        or
        <span className="h-px flex-1 bg-nh-lavender/70" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-nh-charcoal">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-nh-lavender px-4 py-2.5 font-normal focus:border-nh-navy focus:outline-none"
            placeholder="Jane Doe"
          />
        </label>
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
            minLength={6}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-nh-lavender px-4 py-2.5 font-normal focus:border-nh-navy focus:outline-none"
            placeholder="At least 6 characters"
          />
        </label>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-full bg-nh-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
        >
          {busy ? "Creating account…" : planParam === "free" ? "Create free account" : "Continue to payment"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-nh-charcoal/60">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-nh-navy">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
