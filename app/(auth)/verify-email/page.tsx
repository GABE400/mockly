"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Verification token is missing. Please check your verification link.");
      setIsLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await authClient.verifyEmail({
          query: {
            token,
          },
        }, {
          onSuccess: () => {
            setIsLoading(false);
            setSuccess(true);
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          },
          onError: (ctx) => {
            setIsLoading(false);
            setError(ctx.error.message || "Email verification failed. The link may have expired.");
          },
        });
      } catch (err: any) {
        setIsLoading(false);
        setError(err?.message || "An unexpected error occurred during email verification.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="border border-border-medium bg-bg-card backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent z-10" />

      {isLoading ? (
        <div className="text-center py-8 animate-fade-in flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-border-medium flex items-center justify-center text-foreground-pure">
            <svg className="animate-spin h-6 w-6 text-foreground-pure" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-foreground-pure">Verifying email address</h3>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Please wait a moment while we verify your email token...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-4 animate-fade-in flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-foreground-pure">Verification Failed</h3>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            {error}
          </p>
          <Link
            href="/sign-in"
            className="mt-4 w-full py-2.5 px-4 rounded-xl border border-border-medium bg-bg-card hover:bg-bg-card-hover text-sm font-semibold text-foreground-pure transition-all active:scale-[0.98]"
          >
            Back to Sign in
          </Link>
        </div>
      ) : (
        <div className="text-center py-4 animate-fade-in flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-foreground-pure">Email Verified!</h3>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Your email address has been verified successfully! We are redirecting you to your dashboard...
          </p>
          <Link
            href="/dashboard"
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-foreground text-background text-sm font-bold shadow-lg transition-all active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <h2 className="text-xl font-bold text-foreground-pure">Email Verification</h2>
          <p className="text-xs text-text-muted mt-1.5">
            Verifying your security credentials...
          </p>
        </div>

        <Suspense fallback={
          <div className="border border-border-medium bg-bg-card backdrop-blur-md rounded-3xl p-8 shadow-2xl flex items-center justify-center py-12 text-sm text-text-muted">
            Loading verification details...
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>

      </div>
    </div>
  );
}
