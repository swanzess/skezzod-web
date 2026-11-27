import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-nh-lavender/60 bg-nh-cream">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo height={26} href={null} />
            <p className="mt-3 max-w-xs text-sm text-nh-charcoal/60">
              Faith · Family · Learning · Technology — protecting people from scams, one check at a time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h4 className="font-bold text-nh-charcoal">Product</h4>
              <ul className="mt-3 space-y-2 text-nh-charcoal/70">
                <li><Link href="/#features" className="hover:text-nh-navy">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-nh-navy">Pricing</Link></li>
                <li><Link href="/check" className="hover:text-nh-navy">Check a message</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-nh-charcoal">Account</h4>
              <ul className="mt-3 space-y-2 text-nh-charcoal/70">
                <li><Link href="/signup" className="hover:text-nh-navy">Sign up</Link></li>
                <li><Link href="/signin" className="hover:text-nh-navy">Sign in</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-nh-charcoal/10 pt-6 text-xs text-nh-charcoal/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Nerinest. All rights reserved.</span>
          <span>Free plan includes 5 checks per day. No credit card required.</span>
        </div>
      </div>
    </footer>
  );
}
