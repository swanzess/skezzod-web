"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-nh-lavender/60 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo height={28} />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-nh-charcoal/80 transition hover:text-nh-navy"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-nh-navy px-5 py-2 text-sm font-bold text-white transition hover:bg-nh-navy/90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm font-semibold text-nh-charcoal/80 transition hover:text-nh-navy"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-nh-navy px-5 py-2 text-sm font-bold text-white transition hover:bg-nh-navy/90"
              >
                Get protected
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-nh-navy" />
          <span className="h-0.5 w-6 bg-nh-navy" />
          <span className="h-0.5 w-6 bg-nh-navy" />
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-1 border-t border-nh-lavender/60 bg-white px-5 py-4 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="py-2 text-sm font-semibold" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-nh-navy px-5 py-2.5 text-center text-sm font-bold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signin" className="py-2 text-center text-sm font-semibold">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-nh-navy px-5 py-2.5 text-center text-sm font-bold text-white"
                >
                  Get protected
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
