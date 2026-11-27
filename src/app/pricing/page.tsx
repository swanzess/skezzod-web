import type { Metadata } from "next";
import { PLAN_LIST } from "@/lib/plans";
import { PricingCard } from "@/components/PricingCard";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold text-nh-navy">Simple plans for every household</h1>
        <p className="mt-4 text-nh-charcoal/70">
          Start free. Upgrade any time — every paid plan includes a 7-day trial, cancel whenever.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-4">
        {PLAN_LIST.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
