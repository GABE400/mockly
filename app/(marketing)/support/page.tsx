"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SupportPage() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-app text-foreground font-dm-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* Background Gradients & Aura */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] -z-10 pointer-events-none" />

      {/* Header Navigation */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-bg-app/80 backdrop-blur-lg border-b border-border-subtle/60 py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all duration-200">
                <Image 
                  src="/logo.png" 
                  alt="Muckly Logo" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5 object-contain invert brightness-0"
                />
              </div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground-pure">
                Muckly
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            <Link href="/#features" className="hover:text-foreground-pure transition-colors duration-200">Features</Link>
            <Link href="/#playground" className="hover:text-foreground-pure transition-colors duration-200">Playground</Link>
            <Link href="/pricing" className="hover:text-foreground-pure transition-colors duration-200">Pricing</Link>
            <Link href="/support" className="text-foreground-pure font-bold transition-colors duration-200">Support</Link>
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
      <main className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-32 flex flex-col items-center justify-center min-h-[80vh]">
        
        <section className="text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 animate-pulse">
            <svg 
              className="w-6 h-6 text-indigo-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          </div>
          
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Help Center</h2>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground-pure mb-6 leading-tight">
            How can we help?
          </h1>
          <p className="text-text-muted leading-relaxed text-base mb-10 max-w-lg">
            Have questions about Muckly Pro subscriptions, watermark exports, account access, or custom mockup assets? Get in touch and our team will get back to you within 24 hours.
          </p>

          {/* Support Email Card */}
          <div className="w-full max-w-md rounded-3xl border border-border-subtle bg-bg-card p-8 flex flex-col items-center relative overflow-hidden group hover:border-border-strong hover:shadow-[0_15px_30px_rgba(255,255,255,0.01)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            
            <p className="text-xs font-medium text-text-dim mb-2 uppercase tracking-wide">Direct Support Email</p>
            
            <a 
              href="mailto:contact@techadotech.com" 
              className="text-lg md:text-xl font-bold text-foreground-pure hover:text-indigo-400 transition-colors flex items-center gap-2 group/link border-b border-dashed border-border-strong hover:border-indigo-400 pb-1 mb-8 duration-200"
            >
              <span>contact@techadotech.com</span>
              <svg 
                className="w-4 h-4 text-text-dim group-hover/link:text-indigo-400 transition-transform group-hover/link:translate-x-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <a 
              href="mailto:contact@techadotech.com"
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all rounded-2xl px-6 py-3.5 shadow-lg shadow-black/10 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Send Email Now</span>
            </a>
          </div>

          <div className="mt-12 flex items-center gap-2 text-xs text-text-dim">
            <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>All communications are completely secure and encrypted.</span>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 md:px-8 border-t border-border-subtle/50 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
                <Image 
                  src="/logo.png" 
                  alt="Muckly Logo" 
                  width={16} 
                  height={16} 
                  className="w-4 h-4 object-contain invert brightness-0"
                />
              </div>
              <span className="font-bold tracking-tight text-foreground-pure text-base">
                Muckly
              </span>
            </Link>
            <p className="text-xs text-text-dim leading-relaxed">
              Instantly transform raw screenshots into high-end, customizable device mockups. Made for builders, designers, and creators worldwide.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-xs text-text-muted">
            <Link href="/#features" className="hover:text-foreground-pure transition-colors duration-150">Features</Link>
            <Link href="/#playground" className="hover:text-foreground-pure transition-colors duration-150">Playground</Link>
            <Link href="/pricing" className="hover:text-foreground-pure transition-colors duration-150">Pricing</Link>
            <Link href="/support" className="hover:text-foreground-pure transition-colors duration-150">Support</Link>
            <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-text-dim">
          <div>&copy; {new Date().getFullYear()} Muckly Inc. All rights reserved.</div>
          <div className="flex items-center gap-3">
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
            <span className="text-text-dim/40">|</span>
            <div className="flex items-center gap-1.5">
              <span>Powered by</span>
              <a 
                href="https://www.techadotech.com/" 
                className="text-text-muted hover:text-indigo-400 font-medium transition-colors duration-150 border-b border-border-medium hover:border-indigo-400 pb-0.5"
                target="_blank"
                rel="noopener noreferrer"
              >
                Techado Tech
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
