/**
 * Thin localStorage wrapper — mirrors skezzod-app's AsyncStorage-based
 * storage.ts so the auth/session logic above it can be a near-direct port.
 * Safe to import in server components: every call is a no-op during SSR.
 */
const KEYS = {
  authToken: "nh.authToken",
  refreshToken: "nh.refreshToken",
  tokenExpiry: "nh.tokenExpiry",
} as const;

function get(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private-mode / quota — session just won't persist across reloads */
  }
}

function remove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storage = {
  async getAuthToken() {
    return get(KEYS.authToken);
  },
  async saveAuthToken(token: string) {
    set(KEYS.authToken, token);
  },
  async getRefreshToken() {
    return get(KEYS.refreshToken);
  },
  async saveRefreshToken(token: string) {
    set(KEYS.refreshToken, token);
  },
  async getTokenExpiry() {
    return get(KEYS.tokenExpiry);
  },
  async saveTokenExpiry(expiry: string) {
    set(KEYS.tokenExpiry, expiry);
  },
  async clearSession() {
    remove(KEYS.authToken);
    remove(KEYS.refreshToken);
    remove(KEYS.tokenExpiry);
  },
};
