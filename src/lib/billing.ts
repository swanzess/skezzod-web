/**
 * Nerinest (web) — Billing Service
 *
 * Mobile app → backend → Stripe → webhook → backend → Firestore
 * This client NEVER calls Stripe directly; the secret key lives only on
 * skezzod-api (Cloud Run). Same contract as skezzod-app's stripe.ts, but
 * success/cancel URLs are real https:// routes instead of a deep link,
 * since there's no app to return to — the browser just navigates back.
 */
import { ENV } from "./env";
import { getValidToken } from "./auth";
import { PlanId, STRIPE_PRICE_IDS } from "./plans";

const API = ENV.API_URL.replace(/\/$/, "");

export const billingService = {
  async startCheckout(planId: PlanId): Promise<void> {
    const token = await getValidToken();
    if (!token) throw new Error("Not signed in");

    const priceId = STRIPE_PRICE_IDS[planId];
    if (!priceId) throw new Error(`No Stripe price for plan: ${planId}`);

    const res = await fetch(`${API}/api/v1/billing/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        plan: planId,
        success_url: `${ENV.SITE_URL}/dashboard?checkout=success`,
        cancel_url: `${ENV.SITE_URL}/pricing?checkout=cancelled`,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? "Could not start checkout. Please try again.");
    }

    const { url } = await res.json();
    if (!url) throw new Error("No checkout URL returned from server.");
    window.location.href = url;
  },

  async cancelSubscription(): Promise<void> {
    const token = await getValidToken();
    if (!token) throw new Error("Not signed in");

    const res = await fetch(`${API}/api/v1/billing/cancel-subscription`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { detail?: string }).detail ?? "Could not cancel subscription.");
    }
  },

  async getSubscriptionStatus(): Promise<{
    plan: PlanId;
    status: "active" | "trialing" | "past_due" | "canceled" | "none";
    currentPeriodEnd?: string;
    trialEnd?: string;
  }> {
    const token = await getValidToken();
    if (!token) throw new Error("Not signed in");

    const res = await fetch(`${API}/api/v1/billing/subscription-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return { plan: "free", status: "none" };
    return res.json();
  },

  async openBillingPortal(): Promise<void> {
    const token = await getValidToken();
    if (!token) throw new Error("Not signed in");

    const res = await fetch(`${API}/api/v1/billing/portal-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ return_url: `${ENV.SITE_URL}/account` }),
    });

    if (!res.ok) throw new Error("Could not open billing portal.");
    const { url } = await res.json();
    window.location.href = url;
  },
};
