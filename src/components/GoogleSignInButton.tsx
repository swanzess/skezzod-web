"use client";

/**
 * "Sign in with Google" button via Google Identity Services (GIS) — the
 * official script, no Firebase SDK. GIS hands back a Google ID token (a
 * JWT) in its callback; that token is exchanged for Firebase tokens via
 * Identity Toolkit's signInWithIdp endpoint in src/lib/auth.ts. Works
 * identically for sign-up and sign-in (Firebase tells us which via
 * isNewUser — see authService.signInWithGoogle).
 */
import { useEffect, useId, useRef, useState } from "react";
import { ENV } from "@/lib/env";

const GIS_SRC = "https://accounts.google.com/gsi/client";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (resp: GoogleCredentialResponse) => void;
        auto_select?: boolean;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: string;
          theme?: string;
          size?: string;
          shape?: string;
          text?: string;
          width?: string | number;
        },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdServices;
  }
}

let gisLoadPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")));
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

export function GoogleSignInButton({
  onIdToken,
  onError,
  text = "continue_with",
}: {
  onIdToken: (idToken: string) => void;
  onError?: (message: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}) {
  const configured = Boolean(ENV.GOOGLE_CLIENT_ID);
  const containerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    // Not configured yet in this environment — hide rather than show a dead
    // button. See skezzod-web README for the one-time Firebase/Google Cloud
    // console setup this needs. (Checked with a plain boolean, not state —
    // nothing here needs setState from within the effect for this branch.)
    if (!configured) return;
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: ENV.GOOGLE_CLIENT_ID,
          callback: (resp) => onIdToken(resp.credential),
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          width: 320,
        });
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setUnavailable(true);
          onError?.(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, text]);

  if (!configured || unavailable) return null;

  return <div id={containerId} ref={containerRef} className="flex justify-center" />;
}
