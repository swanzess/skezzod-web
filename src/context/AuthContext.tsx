"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, getValidToken, saveSession, SkezzodUser } from "@/lib/auth";
import { twoFactorService } from "@/lib/twofa";
import { PlanId } from "@/lib/plans";

/** What a sign-in/sign-up call resolves to: either the session is complete,
 *  or the account has 2FA on and a code is needed before it's complete —
 *  call completeTwoFactor(code) next (the pending session is held in memory
 *  only; nothing is persisted and no API call needs a token until that
 *  succeeds). */
export type AuthStepResult = { twoFactorRequired: false } | { twoFactorRequired: true };

interface PendingSession {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: SkezzodUser;
}

interface AuthContextValue {
  user: SkezzodUser | null;
  loading: boolean;
  twoFactorPending: boolean;
  signUp: (name: string, email: string, password: string, plan: PlanId) => Promise<AuthStepResult>;
  signIn: (email: string, password: string) => Promise<AuthStepResult>;
  signInWithGoogle: (googleIdToken: string) => Promise<AuthStepResult>;
  completeTwoFactor: (code: string) => Promise<void>;
  cancelTwoFactor: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SkezzodUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingSession | null>(null);

  const loadFromSession = useCallback(async (ignore?: { current: boolean }) => {
    try {
      const token = await getValidToken();
      if (!token) {
        if (!ignore?.current) setUser(null);
        return;
      }
      const profile = await authService.getProfile(token);
      if (!ignore?.current) setUser(profile);
    } catch {
      if (!ignore?.current) setUser(null);
    } finally {
      if (!ignore?.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ignore = { current: false };
    // Loading the signed-in session on mount is a legitimate effect (reading
    // localStorage / calling the profile endpoint), guarded above against
    // setting state after unmount — not the derived-state anti-pattern this
    // rule otherwise targets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFromSession(ignore);
    return () => {
      ignore.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Shared by signUp/signIn/signInWithGoogle: either completes the session
   *  immediately, or — if the account has 2FA on — holds it in memory and
   *  asks for a code first. New signups never have 2FA on yet, but this is
   *  shared so sign-up doesn't need its own copy of the branch. */
  const finishPrimaryAuth = useCallback(
    (result: { token: string; refreshToken?: string; expiresIn: number; user: SkezzodUser }): AuthStepResult => {
      if (result.user.totpEnabled) {
        setPending(result);
        return { twoFactorRequired: true };
      }
      saveSession(result.token, result.refreshToken, result.expiresIn);
      setUser(result.user);
      return { twoFactorRequired: false };
    },
    [],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string, plan: PlanId) => {
      const result = await authService.signUp(name, email, password, plan);
      return finishPrimaryAuth(result);
    },
    [finishPrimaryAuth],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authService.signIn(email, password);
      return finishPrimaryAuth(result);
    },
    [finishPrimaryAuth],
  );

  const signInWithGoogle = useCallback(
    async (googleIdToken: string) => {
      const result = await authService.signInWithGoogle(googleIdToken);
      return finishPrimaryAuth(result);
    },
    [finishPrimaryAuth],
  );

  const completeTwoFactor = useCallback(
    async (code: string) => {
      if (!pending) throw new Error("Nothing to verify. Please sign in again.");
      await twoFactorService.verify(pending.token, code);
      await saveSession(pending.token, pending.refreshToken, pending.expiresIn);
      setUser(pending.user);
      setPending(null);
    },
    [pending],
  );

  const cancelTwoFactor = useCallback(() => {
    setPending(null);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setPending(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        twoFactorPending: pending !== null,
        signUp,
        signIn,
        signInWithGoogle,
        completeTwoFactor,
        cancelTwoFactor,
        signOut,
        refreshProfile: loadFromSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
