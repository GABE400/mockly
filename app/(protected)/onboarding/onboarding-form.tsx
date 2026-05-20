"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./actions";

interface OnboardingFormProps {
  userName: string;
  initialAnswers: Record<string, any>;
}

export default function OnboardingForm({ userName, initialAnswers }: OnboardingFormProps) {
  const router = useRouter();
  
  // Enforce starting at Step 2 if user already accepted terms on Sign-Up screen
  const hasAcceptedTerms = !!initialAnswers?.acceptedTerms;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(hasAcceptedTerms ? 2 : 1);
  
  // Form State
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(hasAcceptedTerms);
  const [useCase, setUseCase] = useState<string>("");
  const [devices, setDevices] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleAcceptTerms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Please check the agreement box to proceed.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleUseCaseSelect = (selected: string) => {
    setUseCase(selected);
    setError(null);
    setStep(3);
  };

  const handleDevicesSelect = async (selected: string) => {
    setDevices(selected);
    setError(null);
    setIsSubmitting(true);

    try {
      // Save answers and mark onboarding as complete
      await completeOnboarding({
        acceptedTerms,
        useCase,
        devices: selected,
      });
      
      setIsSubmitting(false);
      setStep(4);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || "Failed to save onboarding answers. Please try again.");
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  // Progress Bar rendering
  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Premium Glassmorphic Step Indicator & Progress Bar */}
      {step < 4 && (
        <div className="flex flex-col gap-2 shrink-0 select-none">
          <div className="flex justify-between items-center text-xs font-bold text-text-semi-muted uppercase tracking-wider">
            <span>Step {step} of 3</span>
            <span className="text-foreground-pure">{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-bg-input rounded-full overflow-hidden border border-border-subtle">
            <div 
              className="h-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium leading-relaxed animate-fade-in flex gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Terms and Conditions for Social Sign-ups */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          <div className="flex flex-col gap-2 border border-border-subtle bg-bg-input rounded-2xl p-4 select-none max-h-[180px] overflow-y-auto">
            <p className="text-xs font-semibold text-foreground-pure uppercase tracking-wide">Muckly Terms & Conditions</p>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Welcome to Muckly! By creating an account or using our website, you agree to these Terms and Conditions.
            </p>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Muckly provides tools to turn your mobile application screenshots into high-quality, professional mockup presentation graphics. You retain ownership of all images and screenshots you upload. You agree not to upload harmful, offensive, or copyrighted material without permission. Muckly is provided &ldquo;as is&rdquo; without warranties of any kind.
            </p>
          </div>

          <form onSubmit={handleAcceptTerms} className="flex flex-col gap-4">
            <div className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="onboard-terms"
                type="checkbox"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-border-subtle bg-bg-input text-foreground focus:ring-0 cursor-pointer accent-foreground"
              />
              <label htmlFor="onboard-terms" className="text-xs text-text-semi-muted leading-normal cursor-pointer select-none">
                I accept the Terms & Conditions and acknowledge the Privacy Policy.
              </label>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              Agree and Continue
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Use-case Selection */}
      {step === 2 && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          <label className="text-xs font-bold text-text-semi-muted uppercase tracking-wider block select-none">
            What will you use Muckly for?
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "Showcasing my app", label: "Showcasing my app", desc: "Highlight new software features", icon: "📱" },
              { id: "App Store screenshots", label: "App Store screenshots", desc: "Tailor images for stores", icon: "🛍️" },
              { id: "Portfolio", label: "Portfolio", desc: "Make design presentations stand out", icon: "💼" },
              { id: "Client presentations", label: "Client presentations", desc: "Wow corporate stakeholders", icon: "🧑‍💻" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleUseCaseSelect(item.id)}
                className="flex flex-col items-start p-4 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer border-border-subtle bg-bg-card hover:bg-bg-card-hover hover:border-border-strong hover:shadow-md"
              >
                <span className="text-xl mb-2 select-none">{item.icon}</span>
                <span className="text-xs font-bold text-foreground-pure leading-tight select-none">{item.label}</span>
                <span className="text-[10px] text-text-muted mt-1 leading-tight select-none">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Device Frame Preference */}
      {step === 3 && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          <label className="text-xs font-bold text-text-semi-muted uppercase tracking-wider block select-none">
            What devices do you build for?
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "iOS", label: "iOS (Apple)", desc: "iPhone and iPad frames", icon: "🍎" },
              { id: "Android", label: "Android", desc: "Pixel and Galaxy frames", icon: "🤖" },
              { id: "Both", label: "Both platforms", desc: "Access all device styles", icon: "⚡" }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDevicesSelect(item.id)}
                className="flex flex-col items-start p-4 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer border-border-subtle bg-bg-card hover:bg-bg-card-hover hover:border-border-strong hover:shadow-md disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="text-xl mb-2 select-none">{item.icon}</span>
                <span className="text-xs font-bold text-foreground-pure leading-tight select-none">{item.label}</span>
                <span className="text-[10px] text-text-muted mt-1 leading-tight select-none">{item.desc}</span>
              </button>
            ))}
          </div>

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-text-semi-muted animate-pulse">
              <svg className="animate-spin h-4 w-4 text-foreground-pure" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Synchronizing workspace setup...</span>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Welcome screen */}
      {step === 4 && (
        <div className="flex flex-col items-center gap-5 py-6 text-center animate-fade-in select-none">
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-extrabold text-foreground-pure tracking-tight">You&apos;re all set, {userName.split(" ")[0]}!</h3>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed mx-auto">
              Your onboarding is now complete. We have tailored your workspace options based on your device and use-case preferences. Let&apos;s build some stunning screenshots!
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoToDashboard}
            className="w-full mt-4 inline-flex items-center justify-center py-3.5 px-4 rounded-xl bg-foreground text-background hover:opacity-90 active:scale-[0.98] text-sm font-bold shadow-lg transition-all cursor-pointer"
          >
            Go to dashboard
          </button>
        </div>
      )}

    </div>
  );
}
