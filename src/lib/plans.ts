/**
 * Nerinest Plan System (web)
 * Kept in sync by hand with skezzod-app's src/services/plans.ts — same
 * plan IDs, limits and Stripe price env vars, so both clients agree with
 * the backend about what each tier includes.
 */
import { ENV } from "./env";

export type PlanId = "free" | "personal" | "family" | "familyplus";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  priceDisplay: string;
  period: string;
  trialDays: number;
  highlight: boolean;
  badge?: string;
  color: string;
  featureList: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Get started — no credit card needed",
    price: 0,
    priceDisplay: "$0",
    period: "forever",
    trialDays: 0,
    highlight: false,
    color: "#767687",
    featureList: [
      "5 message checks per day",
      "Basic scam alerts",
      "3 Learn lessons per week",
      "Intel dashboard (read-only)",
      "Ad-supported",
    ],
  },
  personal: {
    id: "personal",
    name: "Personal",
    tagline: "Full protection for one person",
    price: 4.99,
    priceDisplay: "$4.99",
    period: "/month",
    trialDays: 7,
    highlight: true,
    badge: "Most Popular",
    color: "#1B5EBF",
    featureList: [
      "Unlimited message checks",
      "No ads, ever",
      "Voice & QR decode",
      "Real-time scam alerts",
      "Full Scam Playbook (22 types)",
      "Priority AI analysis",
      "Export check history",
      "7-day free trial",
    ],
  },
  family: {
    id: "family",
    name: "Family",
    tagline: "Protect everyone under one roof",
    price: 9.99,
    priceDisplay: "$9.99",
    period: "/month",
    trialDays: 7,
    highlight: false,
    badge: "Best Value",
    color: "#1A7A4A",
    featureList: [
      "Everything in Personal",
      "Up to 5 family members",
      "Family Shield dashboard",
      "Shared scam alerts across family",
      "Family activity feed",
      "One account, whole household",
      "7-day free trial",
    ],
  },
  familyplus: {
    id: "familyplus",
    name: "Family+",
    tagline: "Extended family & caregiver protection",
    price: 14.99,
    priceDisplay: "$14.99",
    period: "/month",
    trialDays: 7,
    highlight: false,
    badge: "For Caregivers",
    color: "#B45309",
    featureList: [
      "Everything in Family",
      "Up to 10 family members",
      "Priority support (24hr response)",
      "Caregiver alerts — notified first",
      "Monthly scam report PDF",
      "Ideal for assisted living families",
      "7-day free trial",
    ],
  },
};

export const PLAN_LIST: PlanDefinition[] = [
  PLANS.free,
  PLANS.personal,
  PLANS.family,
  PLANS.familyplus,
];

export const STRIPE_PRICE_IDS: Partial<Record<PlanId, string>> = {
  personal: ENV.STRIPE_PRICE_PERSONAL,
  family: ENV.STRIPE_PRICE_FAMILY,
  familyplus: ENV.STRIPE_PRICE_FAMILYPLUS,
};

export function isPaid(plan: PlanId): boolean {
  return plan !== "free";
}
