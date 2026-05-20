"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the Terms & Conditions to register.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    await authClient.signUp.email(
      {
        name,
        email,
        password,
        onboardingAnswers: JSON.stringify({ acceptedTerms: true }),
        callbackURL: "/onboarding",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.push("/onboarding");
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message || "Registration failed. Please try again.");
        },
      }
    );
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/onboarding",
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || "Google registration failed. Please try again.");
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
          <h2 className="text-xl font-bold text-foreground-pure">Create your free account</h2>
          <p className="text-xs text-text-muted mt-1.5">
            Turn your raw mobile app screenshots into stunning presentations.
          </p>
        </div>

        {/* Card */}
        <div className="border border-border-medium bg-bg-card backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent z-10" />

          {/* Social Sign Up (Google) */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-border-medium bg-bg-card hover:bg-bg-card-hover text-sm font-semibold text-foreground-pure transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <span className="relative px-3 bg-background text-[10px] uppercase font-bold text-text-dim tracking-widest">
              Or register via email
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
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            {/* Name Input */}
            <div className="flex flex-col text-left">
              <label htmlFor="name" className="text-xs font-semibold text-text-semi-muted mb-1.5 ml-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gabriel Chipaya"
                className="w-full py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-input hover:bg-bg-input-hover text-sm text-foreground-pure placeholder-text-dim transition-all focus:outline-none focus:border-border-strong"
              />
            </div>

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
              <label htmlFor="password" className="text-xs font-semibold text-text-semi-muted mb-1.5 ml-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-input hover:bg-bg-input-hover text-sm text-foreground-pure placeholder-text-dim transition-all focus:outline-none focus:border-border-strong"
              />
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2.5 mt-1 text-left">
              <input
                id="terms"
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-border-subtle bg-bg-input text-foreground focus:ring-0 cursor-pointer accent-foreground"
              />
              <label htmlFor="terms" className="text-xs text-text-semi-muted leading-snug cursor-pointer select-none">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-foreground-pure font-bold hover:underline bg-transparent border-none p-0 cursor-pointer inline"
                >
                  Terms & Conditions
                </button>
              </label>
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
                  <span>Registering...</span>
                </div>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

        </div>

        {/* Bottom Switch Link */}
        <p className="text-xs text-text-muted mt-6 text-center select-none">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-foreground-pure font-semibold hover:underline transition-all">
            Sign in
          </Link>
        </p>

      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg border border-border-medium bg-bg-card backdrop-blur-lg rounded-3xl p-8 shadow-2xl relative max-h-[80vh] flex flex-col">
            <h3 className="text-xl font-bold text-foreground-pure mb-4 shrink-0">Terms & Conditions</h3>
            <div className="overflow-y-auto pr-2 text-xs text-text-muted leading-relaxed flex-1 flex flex-col gap-3 select-none">
              <p>Welcome to Muckly! By creating an account or using our website, you agree to these Terms and Conditions.</p>
              <p><strong>1. Services Provided:</strong> Muckly provides tools to turn your mobile application screenshots into high-quality, professional mockup presentation graphics.</p>
              <p><strong>2. User Accounts:</strong> You are responsible for keeping your credentials secure. You must provide accurate information during sign up.</p>
              <p><strong>3. Content Ownership:</strong> You retain full ownership of all images, designs, and screenshots you upload or create. Muckly does not claim any rights to your content.</p>
              <p><strong>4. Prohibited Uses:</strong> You agree not to upload harmful, offensive, illegal, or copyrighted material without permission. Violation may result in account termination.</p>
              <p><strong>5. Limitation of Liability:</strong> Muckly is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages resulting from your use of the service.</p>
              <p><strong>6. Updates to Terms:</strong> We reserve the right to modify these terms at any time. Continued use of Muckly implies acceptance of the updated terms.</p>
            </div>
            <div className="mt-6 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="py-2.5 px-5 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Accept and Close
              </button>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="py-2.5 px-5 rounded-xl border border-border-medium bg-transparent hover:bg-bg-card-hover font-semibold text-xs text-foreground-pure transition-all active:scale-95 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
