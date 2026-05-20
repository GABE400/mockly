"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PricingPage() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoadingPro, setIsLoadingPro] = useState(false);
  const [isLoadingFree, setIsLoadingFree] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProUpgrade = async (e: React.MouseEvent) => {
    if (!session) {
      // User not logged in, proceed to signup with plan parameter
      return;
    }

    // Prevent default anchor link behavior
    e.preventDefault();
    setIsLoadingPro(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      // Redirect immediately to secure Dodo Payments portal
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during checkout initialization.");
      setIsLoadingPro(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/10 selection:text-foreground-pure transition-colors duration-300">
      
      {/* Background Decorative Glow Blobs */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0 transition-all duration-500" 
        style={{
          background: "radial-gradient(circle, var(--glow-blob-1) 0%, var(--glow-blob-2) 40%, transparent 80%)"
        }}
      />
      <div 
        className="absolute bottom-[20%] left-[-10%] w-[50vw] max-w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none z-0 transition-all duration-500" 
        style={{
          background: "radial-gradient(circle, var(--glow-blob-2) 0%, transparent 70%)"
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-300" 
        style={{
          backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Navigation Header */}
      <header 
        className={`z-50 transition-all duration-300 ease-in-out ${
          isScrolled 
            ? "fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl border border-border-medium bg-[var(--header-bg-scrolled)] backdrop-blur-md rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2.5 px-6" 
            : "sticky top-0 w-full border-b border-border-subtle bg-[var(--header-bg)] backdrop-blur-md py-4 px-6 md:px-8"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-all">
              <Image 
                src="/logo.png" 
                alt="Muckly Logo" 
                width={isScrolled ? 28 : 32} 
                height={isScrolled ? 28 : 32} 
                className="rounded-lg shadow-lg shadow-indigo-500/10 object-cover border border-border-subtle transition-all duration-300"
              />
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground-pure">
                Muckly
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <Link href="/#features" className="hover:text-foreground-pure transition-colors duration-200">Features</Link>
            <Link href="/#playground" className="hover:text-foreground-pure transition-colors duration-200">Playground</Link>
            <Link href="/pricing" className="text-foreground-pure font-bold transition-colors duration-200">Pricing</Link>
            <Link href="/#faq" className="hover:text-foreground-pure transition-colors duration-200">FAQ</Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {session ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/dashboard" 
                  className="text-xs md:text-sm font-semibold text-text-semi-muted hover:text-foreground-pure transition-colors duration-200 px-3 py-1.5"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/settings/billing" 
                  className="hidden sm:inline-flex items-center justify-center text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-full px-4 py-2"
                >
                  Manage Account
                </Link>
              </div>
            ) : (
              <>
                <Link 
                  id="nav-login-btn"
                  href="/sign-in" 
                  className="text-xs md:text-sm font-medium text-text-semi-muted hover:text-foreground-pure transition-colors duration-200 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link 
                  id="nav-signup-btn"
                  href="/sign-up" 
                  className="hidden sm:inline-flex items-center justify-center text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-full px-4 py-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-20">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Pricing Header Section */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 animate-fade-in">Plans & Pricing</h2>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground-pure mb-6 leading-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-text-muted leading-relaxed text-base">
            Get started with our completely free tier or unlock unlimited high-resolution assets, luxury templates, and 3D device alignments.
          </p>
        </section>

        {/* Pricing Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-28">
          
          {/* Free Plan Card */}
          <div className="rounded-3xl border border-border-subtle bg-bg-card p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-border-strong hover:shadow-[0_15px_30px_rgba(255,255,255,0.01)] transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-foreground-pure mb-2">Free Plan</h3>
              <p className="text-sm text-text-dim mb-6">For casual makers and designers.</p>
              <div className="flex items-baseline gap-1 text-foreground-pure mb-8">
                <span className="text-4xl md:text-5xl font-extrabold">$0</span>
                <span className="text-sm text-text-dim">/ month</span>
              </div>

              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>5 high-res exports per month</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Standard mobile device frames</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Solid color backgrounds</span>
                </li>
              </ul>
            </div>

            {session ? (
              <Link 
                href="/dashboard"
                className="w-full inline-flex items-center justify-center text-sm font-semibold border border-border-medium hover:bg-bg-card-hover text-foreground-pure rounded-xl py-3 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                id="pricing-free-cta"
                href="/sign-up"
                className="w-full inline-flex items-center justify-center text-sm font-semibold border border-border-medium hover:bg-bg-card-hover text-foreground-pure rounded-xl py-3 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Get started free
              </Link>
            )}
          </div>

          {/* Pro Plan Card */}
          <div className="rounded-3xl border-2 border-indigo-500/30 bg-bg-card p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group shadow-xl shadow-indigo-500/[0.04] hover:border-indigo-500/50 hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)] transition-all duration-300">
            {/* Featured Badge */}
            <div className="absolute top-4 right-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Most Popular
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground-pure mb-2">Pro Plan</h3>
              <p className="text-sm text-text-dim mb-6">For professional designers and creators.</p>
              <div className="flex items-baseline gap-1 text-foreground-pure mb-8">
                <span className="text-4xl md:text-5xl font-extrabold">$9</span>
                <span className="text-sm text-text-dim">/ month</span>
              </div>

              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold text-foreground-pure">Unlimited exports</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All premium frames (MacBook, Tablet, Watch)</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Custom background gradients & 3D tilt angles</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-text-semi-muted">
                  <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No watermarks & 4K HD output</span>
                </li>
              </ul>
            </div>

            {session ? (
              session.user.plan === "pro" ? (
                <Link 
                  href="/settings/billing"
                  className="w-full inline-flex items-center justify-center text-sm font-semibold border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 rounded-xl py-3 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  Manage Subscription
                </Link>
              ) : (
                <button 
                  onClick={handleProUpgrade}
                  disabled={isLoadingPro}
                  className="w-full inline-flex items-center justify-center text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl py-3 shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {isLoadingPro ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Loading checkout...
                    </>
                  ) : (
                    "Upgrade to Pro"
                  )}
                </button>
              )
            ) : (
              <Link 
                id="pricing-pro-cta"
                href="/sign-up?plan=pro"
                className="w-full inline-flex items-center justify-center text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl py-3 shadow-lg shadow-indigo-500/25 hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>

        </section>

        {/* Pricing Features Matrix */}
        <section className="max-w-4xl mx-auto py-16 border-t border-border-subtle text-left">
          <h3 className="text-xl font-bold text-foreground-pure mb-8 text-center md:text-left">Compare Plan Specifications</h3>
          <div className="overflow-x-auto rounded-2xl border border-border-medium bg-bg-card/50 backdrop-blur-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border-subtle bg-foreground/[0.02]">
                  <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure">Features</th>
                  <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center w-1/4">Free</th>
                  <th className="p-4 md:p-5 text-sm font-bold text-indigo-400 text-center w-1/4">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">Monthly exports quota</td>
                  <td className="p-4 text-center text-text-muted font-medium">5 mockups</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Unlimited (∞)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">Standard mobile frames</td>
                  <td className="p-4 text-center text-text-muted font-medium">Included</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">Premium desktop / tablet / watch frames</td>
                  <td className="p-4 text-center text-text-dim">Locked</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">3D perspective & custom rotations</td>
                  <td className="p-4 text-center text-text-dim">Locked</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">Solid color background presets</td>
                  <td className="p-4 text-center text-text-muted font-medium">Included</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">Custom gradient & transparent backgrounds</td>
                  <td className="p-4 text-center text-text-dim">Locked</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">No branding / watermarks</td>
                  <td className="p-4 text-center text-text-dim">Locked</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">High resolution 4K exports</td>
                  <td className="p-4 text-center text-text-dim">Locked</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-semi-muted">Commercial usage license</td>
                  <td className="p-4 text-center text-text-dim">Locked</td>
                  <td className="p-4 text-center font-bold text-foreground-pure bg-indigo-500/[0.01]">Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-[var(--header-bg-scrolled)] relative z-10 py-16 transition-colors">
        <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Muckly Logo" 
                width={24} 
                height={24} 
                className="rounded-md object-cover border border-border-subtle"
              />
              <span className="text-lg font-bold tracking-tight text-foreground-pure">Muckly</span>
            </div>
            <p className="text-xs text-text-dim max-w-xs leading-relaxed text-left">
              Instantly transform raw screenshots into high-end, customizable device mockups. Made for builders, designers, and creators worldwide.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs text-text-muted">
            <Link href="/#features" className="hover:text-foreground-pure transition-colors duration-150">Features</Link>
            <Link href="/#playground" className="hover:text-foreground-pure transition-colors duration-150">Playground</Link>
            <Link href="/pricing" className="hover:text-foreground-pure transition-colors duration-150">Pricing</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
          </div>

        </div>

        <div className="mx-auto max-w-7xl px-6 md:px-8 mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-text-dim">
          <div>&copy; {new Date().getFullYear()} Muckly Inc. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <span>Built by</span>
            <a 
              href="https://github.com/barakis" 
              className="text-text-muted hover:text-indigo-400 font-medium transition-colors duration-150 border-b border-border-medium hover:border-indigo-400 pb-0.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              Barakis
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
