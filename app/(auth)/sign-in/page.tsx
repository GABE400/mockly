"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message || "Invalid credentials. Please try again.");
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden flex items-center justify-center py-16 px-6">
      
      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Background Decorative Glow Blobs */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[800px] h-[500px] rounded-full blur-[130px] pointer-events-none z-0 opacity-40 transition-all duration-500" 
        style={{
          background: "radial-gradient(circle, var(--glow-blob-1) 0%, var(--glow-blob-2) 40%, transparent 80%)"
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-40" 
        style={{
          backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Form Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo / Title Area */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 mb-4 hover:opacity-90 active:scale-95 transition-all">
            <Image 
              src="/logo.png" 
              alt="Muckly Logo" 
              width={40} 
              height={40} 
              className="rounded-xl shadow-lg border border-border-subtle object-cover"
            />
            <span className="text-2xl font-black tracking-tight text-foreground-pure">
              Muckly
            </span>
          </Link>
          <h2 className="text-xl font-bold text-foreground-pure">Welcome back</h2>
          <p className="text-xs text-text-muted mt-1.5">
            Log in to manage your mockups and access premium export options.
          </p>
        </div>

        {/* Card */}
        <div className="border border-border-medium bg-bg-card backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent z-10" />

          {/* Social Sign In (Google) */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-border-medium bg-bg-card hover:bg-bg-card-hover text-sm font-semibold text-foreground-pure transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <span className="relative px-3 bg-background text-[10px] uppercase font-bold text-text-dim tracking-widest">
              Or sign in with email
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium leading-relaxed animate-fade-in flex gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col text-left">
              <label htmlFor="email" className="text-xs font-semibold text-text-semi-muted mb-1.5 ml-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-input hover:bg-bg-input-hover text-sm text-foreground-pure placeholder-text-dim transition-all focus:outline-none focus:border-border-strong"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col text-left">
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label htmlFor="password" className="text-xs font-semibold text-text-semi-muted">
                  Password
                </label>
                <Link href="#" className="text-[10px] font-bold text-text-muted hover:text-foreground-pure transition-colors">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-input hover:bg-bg-input-hover text-sm text-foreground-pure placeholder-text-dim transition-all focus:outline-none focus:border-border-strong"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center py-3.5 px-4 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] text-sm font-bold shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Logging in...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

        </div>

        {/* Bottom Switch Link */}
        <p className="text-xs text-text-muted mt-6 text-center select-none">
          New to Muckly?{" "}
          <Link href="/sign-up" className="text-foreground-pure font-semibold hover:underline transition-all">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
