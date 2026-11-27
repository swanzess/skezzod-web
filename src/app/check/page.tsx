"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, DecodeResponse } from "@/lib/api";
import { VerdictCard } from "@/components/VerdictCard";

export default function CheckPage() {
  const { user, loading } = useAuth();
  const [content, setContent] = useState("");
  const [result, setResult] = useState<DecodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.decode({ content: content.trim(), input_type: "text" });
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-display text-3xl font-bold text-nh-navy">Check a message</h1>
      <p className="mt-2 text-sm text-nh-charcoal/60">
        Paste a suspicious text, email, or link below. We&apos;ll tell you what we see.
      </p>

      {!loading && !user && (
        <div className="mt-6 rounded-xl border border-nh-lavender bg-nh-lavender/20 p-4 text-sm text-nh-charcoal/80">
          <Link href="/signup" className="font-bold text-nh-navy">
            Create a free account
          </Link>{" "}
          to run a check — free plan includes 5 a day, no credit card required.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <textarea
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the text, email, or link here…"
          className="rounded-xl border border-nh-lavender px-4 py-3 text-sm focus:border-nh-navy focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !user}
          className="self-start rounded-full bg-nh-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Check it"}
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>
      )}

      {result && (
        <div className="mt-8">
          <VerdictCard result={result} />
        </div>
      )}
    </div>
  );
}
