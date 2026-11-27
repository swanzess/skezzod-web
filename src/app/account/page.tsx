"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { billingService } from "@/lib/billing";
import { PLANS, isPaid } from "@/lib/plans";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="mx-auto max-w-xl px-5 py-16 text-sm text-nh-charcoal/50">Loading…</div>;
  }

  const plan = PLANS[user.plan];

  async function handlePortal() {
    setBusy("portal");
    setError(null);
    try {
      await billingService.openBillingPortal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal.");
      setBusy(null);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-nh-navy">Account</h1>

      <div className="mt-8 rounded-2xl border border-nh-lavender/70 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-nh-charcoal/50">Signed in as</p>
        <p className="mt-1 font-semibold text-nh-charcoal">{user.name}</p>
        <p className="text-sm text-nh-charcoal/60">{user.email}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-nh-lavender/70 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-nh-charcoal/50">Plan</p>
        <p className="mt-1 font-display text-xl font-bold text-nh-navy">{plan.name}</p>
        <p className="text-sm text-nh-charcoal/60">{plan.tagline}</p>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          {isPaid(user.plan) ? (
            <button
              onClick={handlePortal}
              disabled={busy === "portal"}
              className="rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
            >
              {busy === "portal" ? "Opening…" : "Manage billing"}
            </button>
          ) : (
            <a
              href="/pricing"
              className="rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90"
            >
              Upgrade plan
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-nh-lavender/70 p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-nh-charcoal/50">Two-factor authentication</p>
        <div className="mt-3">
          <TwoFactorSettings enabled={user.totpEnabled} onChanged={() => void refreshProfile()} />
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-8 text-sm font-semibold text-nh-charcoal/60 hover:text-nh-navy"
      >
        Sign out
      </button>
    </div>
  );
}
