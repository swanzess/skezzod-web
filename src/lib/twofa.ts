/**
 * Neri Haven (web) — Two-Factor Authentication (TOTP)
 * Talks to skezzod-api's /api/v1/auth/2fa/* endpoints directly (not Firebase —
 * this is our own app-level 2FA, checked once per sign-in, not per request).
 */
import { ENV } from "./env";

const API = ENV.API_URL.replace(/\/$/, "");

async function call(path: string, token: string, body?: object) {
  const res = await fetch(`${API}/api/v1/auth/2fa/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Something went wrong. Please try again.");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const twoFactorService = {
  /** Starts setup: a new (not-yet-active) TOTP seed + a QR provisioning URI. */
  async setup(token: string): Promise<{ secret: string; otpauth_url: string }> {
    return call("setup", token, {});
  },

  /** Confirms the authenticator app is set up correctly; turns 2FA on and
   *  returns one-time backup codes (shown to the user exactly once). */
  async confirm(token: string, code: string): Promise<{ backup_codes: string[] }> {
    return call("confirm", token, { code });
  },

  /** Login-time check — call after primary sign-in succeeds, before treating
   *  the session as complete, whenever the profile says totpEnabled. */
  async verify(token: string, code: string): Promise<void> {
    await call("verify", token, { code });
  },

  async disable(token: string, code: string): Promise<void> {
    await call("disable", token, { code });
  },
};
