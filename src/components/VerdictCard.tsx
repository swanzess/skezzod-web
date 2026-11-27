import { DecodeResponse } from "@/lib/api";

const VERDICT_STYLE: Record<DecodeResponse["verdict"], { bg: string; fg: string; label: string }> = {
  SCAM: { bg: "#FDECEC", fg: "#B42318", label: "Likely a scam" },
  SUSPICIOUS: { bg: "#FFF4E5", fg: "#B45309", label: "Suspicious" },
  LEGIT: { bg: "#EAF6EE", fg: "#1A7A4A", label: "Looks legitimate" },
  UNKNOWN: { bg: "#F1F1F4", fg: "#51525C", label: "Not enough to go on" },
};

export function VerdictCard({ result }: { result: DecodeResponse }) {
  const style = VERDICT_STYLE[result.verdict] ?? VERDICT_STYLE.UNKNOWN;

  return (
    <div className="rounded-2xl border border-nh-lavender/70 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className="rounded-full px-4 py-1.5 text-sm font-bold"
          style={{ backgroundColor: style.bg, color: style.fg }}
        >
          {style.label}
        </span>
        <span className="text-sm font-semibold text-nh-charcoal/50">
          {Math.round(result.confidence * 100)}% confidence
        </span>
      </div>

      <p className="mt-5 font-display text-xl font-bold text-nh-navy">{result.summary}</p>
      <p className="mt-2 text-sm leading-relaxed text-nh-charcoal/75">{result.insight}</p>

      {result.action && (
        <div className="mt-5 rounded-xl bg-nh-cream p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-nh-charcoal/50">What to do</p>
          <p className="mt-1 text-sm font-semibold text-nh-charcoal">{result.action}</p>
        </div>
      )}

      {result.flags?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {result.flags.map((flag) => (
            <span key={flag} className="rounded-full bg-nh-lavender/40 px-3 py-1 text-xs font-semibold text-nh-charcoal/70">
              {flag}
            </span>
          ))}
        </div>
      )}

      {result.link_intel?.url_found && (
        <div className="mt-5 border-t border-nh-lavender/60 pt-4 text-sm text-nh-charcoal/70">
          <p className="font-bold text-nh-charcoal">Link check</p>
          <ul className="mt-2 space-y-1">
            {result.link_intel.domain && <li>Domain: {result.link_intel.domain}</li>}
            <li>SSL: {result.link_intel.has_ssl ? "Yes" : "No"}</li>
            <li>On a known blacklist: {result.link_intel.is_blacklisted ? "Yes" : "No"}</li>
            {result.link_intel.is_typosquat && <li>Looks like a typosquat of a real domain</li>}
          </ul>
        </div>
      )}

      {result.community_matches > 0 && (
        <p className="mt-5 text-xs text-nh-charcoal/50">
          Matched {result.community_matches} similar report{result.community_matches === 1 ? "" : "s"} from the community.
        </p>
      )}
    </div>
  );
}
