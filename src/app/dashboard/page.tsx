"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, StatsResponse } from "@/lib/api";
import { PLANS } from "@/lib/plans";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) api.getStats().then(setStats).catch(() => setStats(null));
  }, [user]);

  if (loading || !user) {
    return <div className="mx-auto max-w-5xl px-5 py-16 text-sm text-nh-charcoal/50">Loading…</div>;
  }

  const plan = PLANS[user.plan];

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-nh-navy">Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-nh-charcoal/60">
            You&apos;re on the <strong>{plan.name}</strong> plan.
          </p>
        </div>
        {user.plan === "free" && (
          <Link
            href="/pricing"
            className="rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90"
          >
            Upgrade plan
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/check"
          className="rounded-2xl border border-nh-navy bg-nh-navy p-6 text-white transition hover:bg-nh-navy/90"
        >
          <p className="font-display text-xl font-bold">Check a message</p>
          <p className="mt-2 text-sm text-white/70">Paste a text, email, or link for an instant verdict.</p>
        </Link>

        <div className="rounded-2xl border border-nh-lavender/70 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-nh-charcoal/50">This week</p>
          <p className="mt-2 font-display text-3xl font-bold text-nh-navy">
            {stats ? stats.scams_caught_this_week.toLocaleString() : "—"}
          </p>
          <p className="mt-1 text-sm text-nh-charcoal/60">scams caught across the community</p>
        </div>

        <div className="rounded-2xl border border-nh-lavender/70 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-nh-charcoal/50">Detection accuracy</p>
          <p className="mt-2 font-display text-3xl font-bold text-nh-navy">
            {stats ? `${stats.accuracy_pct}%` : "—"}
          </p>
          <p className="mt-1 text-sm text-nh-charcoal/60">{stats?.community_note ?? "based on community reports"}</p>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/account" className="text-sm font-semibold text-nh-navy">
          Manage account & billing →
        </Link>
      </div>
    </div>
  );
}
