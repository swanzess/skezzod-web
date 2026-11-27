import Link from "next/link";
import { PlanDefinition } from "@/lib/plans";
import { IconCheck } from "./icons";

export function PricingCard({ plan }: { plan: PlanDefinition }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        plan.highlight
          ? "border-nh-navy bg-nh-navy text-white shadow-xl shadow-nh-navy/20"
          : "border-nh-lavender bg-white"
      }`}
    >
      {plan.badge && (
        <span
          className="absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: plan.color }}
        >
          {plan.badge}
        </span>
      )}

      <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
      <p className={`mt-1 text-sm ${plan.highlight ? "text-white/70" : "text-nh-charcoal/60"}`}>
        {plan.tagline}
      </p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold">{plan.priceDisplay}</span>
        <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-nh-charcoal/60"}`}>
          {plan.period}
        </span>
      </div>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.featureList.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 flex-shrink-0">
              <IconCheck color={plan.highlight ? "#3FB7B3" : "#1A7A4A"} />
            </span>
            <span className={plan.highlight ? "text-white/90" : "text-nh-charcoal/80"}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.id === "free" ? "/signup" : `/signup?plan=${plan.id}`}
        className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-bold transition ${
          plan.highlight
            ? "bg-white text-nh-navy hover:bg-nh-cream"
            : "bg-nh-navy text-white hover:bg-nh-navy/90"
        }`}
      >
        {plan.id === "free" ? "Start free" : `Start ${plan.trialDays}-day trial`}
      </Link>
    </div>
  );
}
