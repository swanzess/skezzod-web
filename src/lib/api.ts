/**
 * Neri Haven (web) — API Service
 * All calls to the Cloud Run backend go through here.
 * No secrets in this file — the backend owns all keys.
 * Port of skezzod-app's src/services/api.ts.
 */
import { ENV } from "./env";
import { getValidToken } from "./auth";

export type Verdict = "SCAM" | "SUSPICIOUS" | "LEGIT" | "UNKNOWN";
export type InputType = "text" | "url" | "ocr" | "voice";

export interface DecodeRequest {
  content: string;
  input_type?: InputType;
  region_hint?: string;
}

export interface LinkIntel {
  url_found: boolean;
  domain?: string;
  domain_age_days?: number;
  is_blacklisted: boolean;
  has_ssl: boolean;
  is_typosquat: boolean;
  blacklist_engines_triggered: string[];
  risk_score: number;
}

export interface DecodeResponse {
  verdict: Verdict;
  confidence: number;
  category: string;
  summary: string;
  action: string;
  insight: string;
  flags: string[];
  layers_triggered: string[];
  community_matches: number;
  signal_hash: string;
  pattern_signals: string[];
  link_intel?: LinkIntel;
}

export interface TrendItem {
  category: string;
  count: number;
  pct: number;
}

export interface TrendsResponse {
  week_trends: TrendItem[];
  data_note: string;
}

export interface StatsResponse {
  total_decodes_this_week: number;
  scams_caught_this_week: number;
  accuracy_pct: number;
  community_note: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function friendlyMessage(status: number): string {
  if (status === 401 || status === 403) return "Please sign in again to continue.";
  if (status === 429) return "You've reached today's limit. Try again tomorrow or upgrade your plan.";
  if (status === 422 || status === 400) return "We couldn't read that. Please check it and try again.";
  if (status >= 500) return "Our servers are busy right now. Please try again in a moment.";
  return "Something went wrong. Please try again.";
}

class NeriHavenAPI {
  private baseUrl: string;
  private timeout = 30_000;

  constructor() {
    this.baseUrl = ENV.API_URL.replace(/\/$/, "");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const token = await getValidToken().catch(() => null);
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (!res.ok) {
        if (ENV.IS_DEV) console.warn(`API ${res.status} ${path}`);
        throw new ApiError(res.status, friendlyMessage(res.status));
      }

      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      if (err instanceof ApiError) throw err;
      if (err instanceof TypeError) {
        throw new Error("No internet connection. Please check your connection and try again.");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async decode(req: DecodeRequest): Promise<DecodeResponse> {
    return this.request<DecodeResponse>("/api/v1/decode", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  async deleteAccount(): Promise<void> {
    await this.request<void>("/api/v1/auth/account", { method: "DELETE" });
  }

  async getHealth(): Promise<{ status: string }> {
    return this.request("/api/v1/health");
  }

  async getTrends(): Promise<TrendsResponse> {
    return this.request("/api/v1/intel/trends");
  }

  async getStats(): Promise<StatsResponse> {
    return this.request("/api/v1/intel/stats");
  }
}

export const api = new NeriHavenAPI();
