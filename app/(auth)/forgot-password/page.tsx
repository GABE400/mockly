"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      }, {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          setSuccess(true);
        },
        onError: (ctx: any) => {
          setIsLoading(false);
          setError(ctx.error.message || "Failed to send reset link. Please try again.");
        },
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "An unexpected error occurred.");
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
          <h2 className="text-xl font-bold text-foreground-pure">Reset your password</h2>
          <p className="text-xs text-text-muted mt-1.5">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="border border-border-medium bg-bg-card backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent z-10" />

          {/* Success message */}
          {success ? (
            <div className="text-center py-4 animate-fade-in flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-foreground-pure">Reset link sent!</h3>
              <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have sent a secure password reset link. Please check your inbox.
              </p>
              <Link
                href="/sign-in"
                className="mt-4 w-full py-2.5 px-4 rounded-xl border border-border-medium bg-bg-card hover:bg-bg-card-hover text-sm font-semibold text-foreground-pure transition-all active:scale-[0.98]"
              >
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium leading-relaxed animate-fade-in flex gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

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
                    <span>Sending link...</span>
                  </div>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Bottom Switch Link */}
        {!success && (
          <p className="text-xs text-text-muted mt-6 text-center select-none">
            Remember your password?{" "}
            <Link href="/sign-in" className="text-foreground-pure font-semibold hover:underline transition-all">
              Sign in
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}
