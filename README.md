# Nerinest — Web

Standalone web app for Nerinest — **separate from the mobile app**
(`skezzod-app`, React Native/Expo), built web-native with Next.js, and
sharing the same backend (`skezzod-api`) and Firebase Auth project.

## Why a separate codebase

The web experience used to be the mobile app's Expo web export, reused
as-is. That worked but looked and felt like a mobile screen stretched into
a browser. This repo replaces it with a real website: a proper marketing
home page plus a lightweight client app (sign up/in, the scam checker,
pricing/checkout, account) built with web-native layout and navigation —
no React Native involved.

## Stack

- **Next.js** (App Router), statically exported (`output: "export"`) — this
  is a client-only SPA, there's no Next.js server in production
- **TypeScript + Tailwind CSS v4**
- **Firebase Identity Toolkit REST API** for auth (same contract as
  `skezzod-app/src/services/auth.ts` — no Firebase SDK, just `fetch`),
  plus **Sign in with Google** (Google Identity Services script, exchanged
  for Firebase tokens via Identity Toolkit — see `src/components/GoogleSignInButton.tsx`)
- **Two-factor authentication** (authenticator-app TOTP, not Firebase's paid
  Identity Platform MFA) via skezzod-api's `/auth/2fa/*` endpoints — checked
  once at sign-in, with backup codes. See `src/lib/twofa.ts`,
  `src/components/TwoFactorSettings.tsx` and `src/components/TwoFactorPrompt.tsx`
- **Stripe Checkout** via `skezzod-api` — this client never talks to Stripe
  directly; it only ever gets a hosted checkout URL back from the backend
- Brand fonts (Playfair Display, Montserrat, Pacifico) self-hosted via
  `@fontsource/*` — no runtime calls to Google Fonts

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the Firebase/Stripe values
npm run dev
```

## Deploy

`.github/workflows/deploy.yml` builds the static export and deploys it to
Firebase Hosting (the same `skezzod-prod` default site that used to be
served by `skezzod-app`'s web export — that workflow is now disabled, see
its header comment). See the workflow file for the full list of required
repo secrets.

## Project layout

```
src/
  app/            — routes (home, pricing, signup, signin, check, dashboard, account, …)
  components/      — Navbar, Footer, Logo, PricingCard, VerdictCard, icons
  context/         — AuthContext (session state)
  lib/             — env, auth, api, billing, plans — ports of skezzod-app's
                      src/services/* so both clients agree with the backend
```

## What's here vs. what's next

Shipped: marketing home, pricing, sign up/in/forgot-password, the core
scam checker (`/check`), Stripe checkout, a basic dashboard and account
page. Not yet ported from the mobile app: Family management, Learn
lessons, the full Scam Playbook, and Intel trend charts — the mobile app
remains the full-featured client until those land here too.
