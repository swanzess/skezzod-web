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
import { PlanId } from "@/lib/plans";

interface AuthContextValue {
  user: SkezzodUser | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string, plan: PlanId) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SkezzodUser | null>(null);
  const [loading, setLoading] = useState(true);

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

  const signUp = useCallback(async (name: string, email: string, password: string, plan: PlanId) => {
    const result = await authService.signUp(name, email, password, plan);
    await saveSession(result.token, result.refreshToken, result.expiresIn);
    setUser(result.user);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    await saveSession(result.token, result.refreshToken, result.expiresIn);
    setUser(result.user);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, refreshProfile: loadFromSession }}
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
