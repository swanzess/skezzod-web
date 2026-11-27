import Link from "next/link";
import Image from "next/image";
import { PLAN_LIST } from "@/lib/plans";
import { PricingCard } from "@/components/PricingCard";
import { IconSearch, IconPeople, IconBrain, IconChart } from "@/components/icons";

const FEATURES = [
  {
    Icon: IconSearch,
    title: "Instant checks",
    text: "Paste any suspicious text, link, or call transcript and get a verdict in seconds.",
  },
  {
    Icon: IconPeople,
    title: "Whole-family protection",
    text: "Add parents, grandparents, and kids to one account and watch over everyone at once.",
  },
  {
    Icon: IconBrain,
    title: "AI-powered detection",
    text: "Trained on thousands of real scam patterns, updated continuously as new ones emerge.",
  },
  {
    Icon: IconChart,
    title: "Live community intel",
    text: "See what scams are trending this week, sourced from real checks across the community.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-nh-navy">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pb-20 pt-20 text-center sm:pt-28">
          <Image
            src="/brand/wordmark-white.png"
            alt="Nerinest"
            width={420}
            height={115}
            priority
            className="h-[70px] w-auto sm:h-[90px]"
          />
          <h1 className="mt-8 max-w-3xl font-display text-4xl font-bold text-white sm:text-5xl">
            Protect yourself and your family from scams
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Check any suspicious text, link, or call instantly. Free to start — no credit card required.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-nh-navy transition hover:bg-nh-cream"
            >
              Get protected — it&apos;s free
            </Link>
            <Link
              href="/check"
              className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Try a check
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-nh-navy sm:text-4xl">
            Everything you need to stay a step ahead
          </h2>
          <p className="mt-4 text-nh-charcoal/70">
            Built for the whole family — from the first scam text to a lifetime of safer logins.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-nh-lavender/70 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nh-lavender/40">
                <Icon />
              </div>
              <h3 className="mt-4 font-bold text-nh-charcoal">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-nh-charcoal/65">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gradient divider band */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="h-px w-full nh-gradient-bg opacity-60" />
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-nh-navy sm:text-4xl">
            Simple plans for every household
          </h2>
          <p className="mt-4 text-nh-charcoal/70">
            Start free. Upgrade any time — every paid plan includes a 7-day trial.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {PLAN_LIST.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-nh-cream">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-nh-navy sm:text-4xl">
            Scams move fast. So should you.
          </h2>
          <p className="mt-4 text-nh-charcoal/70">
            Join Nerinest today — free forever on the basics, upgrade when you need more.
          </p>
          <Link
            href="/signup"
            className="mt-8 rounded-full bg-nh-navy px-8 py-3.5 text-sm font-bold text-white transition hover:bg-nh-navy/90"
          >
            Get protected — it&apos;s free
          </Link>
        </div>
      </section>
    </div>
  );
}
