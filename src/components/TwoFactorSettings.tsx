"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { getValidToken } from "@/lib/auth";
import { twoFactorService } from "@/lib/twofa";

type Step = "idle" | "setup" | "confirm" | "backup_codes" | "disable";

/** Account-page 2FA management: enable (scan QR -> confirm code -> save
 *  backup codes) and disable (confirm with a code first). Lives entirely
 *  client-side against skezzod-api's /auth/2fa/* endpoints — see
 *  src/lib/twofa.ts. */
export function TwoFactorSettings({
  enabled,
  onChanged,
}: {
  enabled: boolean;
  onChanged: () => void;
}) {
  const [step, setStep] = useState<Step>("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setStep("idle");
    setQrDataUrl(null);
    setManualSecret(null);
    setCode("");
    setBackupCodes(null);
    setError(null);
    setBusy(false);
  }

  async function startSetup() {
    setError(null);
    setBusy(true);
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Session expired. Please sign in again.");
      const { secret, otpauth_url } = await twoFactorService.setup(token);
      const qr = await QRCode.toDataURL(otpauth_url, { width: 240, margin: 1 });
      setManualSecret(secret);
      setQrDataUrl(qr);
      setStep("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start 2FA setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Session expired. Please sign in again.");
      const { backup_codes } = await twoFactorService.confirm(token, code.trim());
      setBackupCodes(backup_codes);
      setStep("backup_codes");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't match. Check the app and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const token = await getValidToken();
      if (!token) throw new Error("Session expired. Please sign in again.");
      await twoFactorService.disable(token, code.trim());
      reset();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't match.");
      setBusy(false);
    }
  }

  function finishEnabling() {
    reset();
    onChanged();
  }

  // ── Already on, no flow in progress: show status + disable entry point ──
  if (enabled && step === "idle") {
    return (
      <div>
        <p className="text-sm text-nh-charcoal/70">
          Two-factor authentication is <span className="font-semibold text-nh-navy">on</span>. You&apos;ll be
          asked for a code from your authenticator app each time you sign in.
        </p>
        <button
          onClick={() => setStep("disable")}
          className="mt-4 rounded-full border border-nh-lavender px-5 py-2.5 text-sm font-bold text-nh-charcoal transition hover:border-nh-navy"
        >
          Turn off 2FA
        </button>
      </div>
    );
  }

  if (step === "disable") {
    return (
      <form onSubmit={confirmDisable} className="flex flex-col gap-3">
        <p className="text-sm text-nh-charcoal/70">
          Enter a code from your authenticator app (or a backup code) to turn 2FA off.
        </p>
        <input
          required
          autoFocus
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          className="rounded-xl border border-nh-lavender px-4 py-2.5 text-center tracking-[0.3em] focus:border-nh-navy focus:outline-none"
        />
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
          >
            {busy ? "Turning off…" : "Turn off 2FA"}
          </button>
          <button type="button" onClick={reset} className="text-sm font-semibold text-nh-charcoal/60">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // ── Not on, nothing in progress ──
  if (!enabled && step === "idle") {
    return (
      <div>
        <p className="text-sm text-nh-charcoal/70">
          Two-factor authentication is <span className="font-semibold">off</span>. Turn it on to require a code
          from an authenticator app (Google Authenticator, Authy, 1Password, etc.) each time you sign in.
        </p>
        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
        <button
          onClick={startSetup}
          disabled={busy}
          className="mt-4 rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
        >
          {busy ? "Starting…" : "Set up 2FA"}
        </button>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div>
        <p className="text-sm text-nh-charcoal/70">
          Scan this with your authenticator app, then enter the 6-digit code it shows.
        </p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="2FA QR code" className="mx-auto mt-4 h-[180px] w-[180px] rounded-xl border border-nh-lavender/70" />
        )}
        {manualSecret && (
          <p className="mt-3 text-center text-xs text-nh-charcoal/50">
            Can&apos;t scan it? Enter this code manually:{" "}
            <span className="font-mono font-semibold text-nh-charcoal">{manualSecret}</span>
          </p>
        )}
        <form onSubmit={confirmSetup} className="mt-5 flex flex-col gap-3">
          <input
            required
            autoFocus
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="rounded-xl border border-nh-lavender px-4 py-2.5 text-center tracking-[0.3em] focus:border-nh-navy focus:outline-none"
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90 disabled:opacity-60"
            >
              {busy ? "Confirming…" : "Confirm"}
            </button>
            <button type="button" onClick={reset} className="text-sm font-semibold text-nh-charcoal/60">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === "backup_codes" && backupCodes) {
    return (
      <div>
        <p className="text-sm font-semibold text-nh-navy">2FA is on.</p>
        <p className="mt-2 text-sm text-nh-charcoal/70">
          Save these one-time backup codes somewhere safe. Each works once, if you ever lose access to your
          authenticator app. They won&apos;t be shown again.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-nh-cream p-4 font-mono text-sm">
          {backupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <button
          onClick={finishEnabling}
          className="mt-5 rounded-full bg-nh-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-nh-navy/90"
        >
          I&apos;ve saved these codes
        </button>
      </div>
    );
  }

  return null;
}
