/**
 * Nerinest (web) — Environment Configuration
 * NEXT_PUBLIC_ vars are bundled into the client build — never put secrets here.
 * Mirrors skezzod-app's src/services/env.ts so both clients talk to the
 * same backend the same way.
 */
export const ENV = {
  API_URL:
    process.env.NEXT_PUBLIC_API_URL ??
    "https://skezzod-api-3evmje7tva-uc.a.run.app",

  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  FIREBASE_PROJECT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "skezzod-prod",

  // Stripe price IDs only — Checkout Sessions are created server-side by
  // skezzod-api, which holds the secret key. This client never talks to
  // Stripe directly.
  STRIPE_PRICE_PERSONAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERSONAL ?? "",
  STRIPE_PRICE_FAMILY: process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY ?? "",
  STRIPE_PRICE_FAMILYPLUS:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILYPLUS ?? "",

  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.nerinest.com",

  IS_DEV: process.env.NODE_ENV !== "production",
} as const;
