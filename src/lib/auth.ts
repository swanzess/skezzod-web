/**
 * Nerinest (web) — Auth Service
 * Firebase Identity Toolkit REST API — no SDK needed.
 * Direct port of skezzod-app's src/services/auth.ts so both clients use
 * the exact same backend contract.
 */
import { ENV } from "./env";
import { storage } from "./storage";

const FB_BASE = "https://identitytoolkit.googleapis.com/v1/accounts";
const API = ENV.API_URL.replace(/\/$/, "");

export interface SkezzodUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "personal" | "family" | "familyplus";
  guardScore: number;
  joinedAt: string;
  totpEnabled: boolean;
}

function friendlyError(msg: string): string {
  if (msg.includes("EMAIL_EXISTS")) return "An account with this email already exists.";
  if (msg.includes("EMAIL_NOT_FOUND")) return "No account found with this email.";
  if (msg.includes("INVALID_PASSWORD")) return "Incorrect password. Please try again.";
  if (msg.includes("INVALID_LOGIN_CREDENTIALS")) return "Incorrect email or password.";
  if (msg.includes("INVALID_EMAIL")) return "Please enter a valid email address.";
  if (msg.includes("TOO_MANY_ATTEMPTS")) return "Too many attempts. Please try again later.";
  if (msg.includes("WEAK_PASSWORD")) return "Password must be at least 6 characters.";
  if (msg.includes("INVALID_IDP_RESPONSE")) return "Google sign-in didn't go through. Please try again.";
  return "Something went wrong. Please try again.";
}

async function fbRequest(endpoint: string, body: object) {
  const key = ENV.FIREBASE_API_KEY;
  if (!key) throw new Error("App not configured. Please contact support.");
  const res = await fetch(`${FB_BASE}:${endpoint}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(friendlyError(data.error.message ?? ""));
  return data;
}

// ── Session renewal ─────────────────────────────────────────────────────
let renewing: Promise<string | null> | null = null;

async function renewSession(): Promise<string | null> {
  const refresh = await storage.getRefreshToken();
  const current = await storage.getAuthToken();
  if (!refresh) return current;
  const key = ENV.FIREBASE_API_KEY;
  if (!key) return current;
  let res: Response;
  try {
    res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refresh)}`,
    });
  } catch {
    return current; // offline — let the request try and fail normally
  }
  if (!res.ok) {
    if (res.status >= 500) return current;
    return null; // Firebase says this login is no longer valid
  }
  const d = await res.json();
  await storage.saveAuthToken(d.id_token);
  if (d.refresh_token) await storage.saveRefreshToken(d.refresh_token);
  await storage.saveTokenExpiry(String(Date.now() + (Number(d.expires_in) || 3600) * 1000));
  return d.id_token as string;
}

/** The signed-in user's current ID token, renewed first if about to expire. Null = signed out. */
export async function getValidToken(): Promise<string | null> {
  const token = await storage.getAuthToken();
  if (!token) return null;
  const expiry = Number((await storage.getTokenExpiry()) ?? 0);
  if (expiry && Date.now() < expiry - 60_000) return token;
  if (!renewing) renewing = renewSession().finally(() => { renewing = null; });
  return renewing;
}

export async function saveSession(token: string, refreshToken: string | undefined, expiresInSec: number) {
  await storage.saveAuthToken(token);
  if (refreshToken) await storage.saveRefreshToken(refreshToken);
  await storage.saveTokenExpiry(String(Date.now() + (expiresInSec || 3600) * 1000));
}

export const authService = {
  async signUp(name: string, email: string, password: string, plan: string) {
    const fb = await fbRequest("signUp", { email, password });
    const res = await fetch(`${API}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${fb.idToken}` },
      body: JSON.stringify({ display_name: name, plan }),
    });
    let user: SkezzodUser;
    if (res.ok) {
      const d = await res.json();
      user = {
        id: d.id ?? fb.localId,
        name: d.name ?? name,
        email: d.email ?? fb.email,
        plan: d.plan ?? "free",
        guardScore: d.guard_score ?? 50,
        joinedAt: d.joined_at ?? new Date().toISOString(),
        totpEnabled: Boolean(d.totp_enabled),
      };
    } else {
      try {
        user = await authService.getProfile(fb.idToken as string);
      } catch {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? "Registration failed.");
      }
    }
    return {
      token: fb.idToken as string,
      refreshToken: fb.refreshToken as string | undefined,
      expiresIn: Number(fb.expiresIn) || 3600,
      user,
    };
  },

  async signIn(email: string, password: string) {
    const fb = await fbRequest("signInWithPassword", { email, password });
    const user = await authService.getProfile(fb.idToken as string);
    return {
      token: fb.idToken as string,
      refreshToken: fb.refreshToken as string | undefined,
      expiresIn: Number(fb.expiresIn) || 3600,
      user,
    };
  },

  /**
   * Google sign-in/sign-up. `googleIdToken` is the JWT credential Google
   * Identity Services hands back in its callback (see GoogleSignInButton) —
   * exchanged here for Firebase tokens via Identity Toolkit's generic
   * federated-identity endpoint, no Firebase SDK needed. Works for both a
   * brand-new account and a returning one; Firebase tells us which via
   * `isNewUser`, and only a new one needs our backend /auth/register call
   * (a returning one already has a Firestore profile).
   */
  async signInWithGoogle(googleIdToken: string) {
    const fb = await fbRequest("signInWithIdp", {
      requestUri: typeof window !== "undefined" ? window.location.origin : ENV.SITE_URL,
      postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
      returnIdpCredential: true,
    });

    let user: SkezzodUser;
    if (fb.isNewUser) {
      const res = await fetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${fb.idToken}` },
        body: JSON.stringify({ display_name: fb.displayName || fb.email || "Nerinest User", plan: "free" }),
      });
      if (res.ok) {
        const d = await res.json();
        user = {
          id: d.id,
          name: d.name,
          email: d.email,
          plan: d.plan ?? "free",
          guardScore: d.guard_score ?? 50,
          joinedAt: d.joined_at ?? new Date().toISOString(),
          totpEnabled: Boolean(d.totp_enabled),
        };
      } else {
        user = await authService.getProfile(fb.idToken as string);
      }
    } else {
      user = await authService.getProfile(fb.idToken as string);
    }

    return {
      token: fb.idToken as string,
      refreshToken: fb.refreshToken as string | undefined,
      expiresIn: Number(fb.expiresIn) || 3600,
      user,
    };
  },

  async getProfile(token: string): Promise<SkezzodUser> {
    const res = await fetch(`${API}/api/v1/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401 || res.status === 403) throw new Error("Session expired. Please sign in again.");
    if (!res.ok) throw new Error("Our servers are busy right now. Please try again in a moment.");
    const d = await res.json();
    return {
      id: d.id,
      name: d.name,
      email: d.email,
      plan: d.plan ?? "free",
      guardScore: d.guard_score ?? 50,
      joinedAt: d.joined_at ?? new Date().toISOString(),
      totpEnabled: Boolean(d.totp_enabled),
    };
  },

  async sendPasswordReset(email: string) {
    await fbRequest("sendOobCode", { requestType: "PASSWORD_RESET", email });
  },

  async signOut() {
    await storage.clearSession();
  },
};
