"use client";

import React, { useState, useEffect } from "react";
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
  
  // Dynamic entry animation trigger per step transition
  const [animating, setAnimating] = useState<boolean>(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [step]);

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
            <span className="text-indigo-400 font-extrabold">{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-bg-input rounded-full overflow-hidden border border-border-subtle p-[1px]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium leading-relaxed animate-fade-in flex gap-2 shadow-lg">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Step Layout Wrapper with smooth opacity shift */}
      <div className={`transition-all duration-300 ${animating ? "opacity-30 translate-y-1 scale-[0.99]" : "opacity-100 translate-y-0 scale-100"}`}>
        
        {/* Step 1: Terms and Conditions for Social Sign-ups */}
        {step === 1 && (
          <div className="flex flex-col gap-4 text-left animate-slide-in">
            <div className="flex flex-col gap-2 border border-border-subtle bg-bg-input rounded-2xl p-4 select-none max-h-[180px] overflow-y-auto custom-scrollbar shadow-inner relative">
              <p className="text-xs font-extrabold text-foreground-pure uppercase tracking-wide">Muckly Terms & Conditions</p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Welcome to Muckly! By creating an account or using our website, you agree to these Terms and Conditions.
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Muckly provides tools to turn your mobile application screenshots into high-quality, professional mockup presentation graphics. You retain ownership of all images and screenshots you upload. You agree not to upload harmful, offensive, or copyrighted material without permission. Muckly is provided &ldquo;as is&rdquo; without warranties of any kind.
              </p>
            </div>

            <form onSubmit={handleAcceptTerms} className="flex flex-col gap-4">
              <div className="flex items-start gap-3 cursor-pointer group bg-bg-card hover:bg-bg-card-hover border border-border-subtle hover:border-border-strong rounded-xl p-3 transition-all duration-300">
                <input
                  id="onboard-terms"
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4.5 h-4.5 mt-0.5 rounded-md border-border-strong bg-bg-input text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-500"
                />
                <label htmlFor="onboard-terms" className="text-xs text-text-semi-muted leading-normal cursor-pointer select-none group-hover:text-foreground-pure transition-colors">
                  I accept the Terms & Conditions and acknowledge the Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl bg-foreground text-background hover:opacity-95 active:scale-[0.98] text-sm font-bold shadow-[0_4px_20px_rgba(255,255,255,0.08)] transition-all cursor-pointer hover:shadow-indigo-500/10 hover:border-indigo-500/20"
              >
                Agree and Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Use-case Selection */}
        {step === 2 && (
          <div className="flex flex-col gap-4 text-left animate-slide-in">
            <label className="text-xs font-bold text-text-semi-muted uppercase tracking-wider block select-none">
              What will you use Muckly for?
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { id: "Showcasing my app", label: "Showcasing my app", desc: "Highlight new software features", icon: "📱", gradient: "from-blue-500/10 to-indigo-500/10 hover:border-indigo-500/40" },
                { id: "App Store screenshots", label: "App Store screenshots", desc: "Tailor images for stores", icon: "🛍️", gradient: "from-pink-500/10 to-rose-500/10 hover:border-rose-500/40" },
                { id: "Portfolio", label: "Portfolio", desc: "Make design presentations stand out", icon: "💼", gradient: "from-purple-500/10 to-fuchsia-500/10 hover:border-purple-500/40" },
                { id: "Client presentations", label: "Client presentations", desc: "Wow corporate stakeholders", icon: "🧑‍💻", gradient: "from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/40" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleUseCaseSelect(item.id)}
                  className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-border-subtle bg-bg-card hover:bg-gradient-to-br ${item.gradient} hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group`}
                >
                  <span className="text-2xl mb-3 select-none group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span className="text-xs font-extrabold text-foreground-pure leading-tight select-none group-hover:text-foreground transition-colors">{item.label}</span>
                  <span className="text-[10px] text-text-muted mt-1 leading-normal select-none group-hover:text-text-semi-muted transition-colors">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Device Frame Preference */}
        {step === 3 && (
          <div className="flex flex-col gap-4 text-left animate-slide-in">
            <label className="text-xs font-bold text-text-semi-muted uppercase tracking-wider block select-none">
              What devices do you build for?
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: "iOS", label: "iOS (Apple)", desc: "iPhone and iPad frames", icon: "🍎", ringColor: "group-hover:border-rose-500/40 hover:shadow-rose-500/5", glow: "rgba(239, 68, 68, 0.1)" },
                { id: "Android", label: "Android", desc: "Pixel and Galaxy frames", icon: "🤖", ringColor: "group-hover:border-emerald-500/40 hover:shadow-emerald-500/5", glow: "rgba(16, 185, 129, 0.1)" },
                { id: "Both", label: "Both platforms", desc: "Access all device styles", icon: "⚡", ringColor: "group-hover:border-indigo-500/40 hover:shadow-indigo-500/5", glow: "rgba(99, 102, 241, 0.1)" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDevicesSelect(item.id)}
                  className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-border-subtle bg-bg-card hover:bg-bg-card-hover group disabled:opacity-50 disabled:pointer-events-none ${item.ringColor}`}
                  style={{
                    boxShadow: `inset 0 0 12px ${item.glow}`
                  }}
                >
                  <span className="text-2xl mb-3 select-none group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <span className="text-xs font-extrabold text-foreground-pure leading-tight select-none">{item.label}</span>
                  <span className="text-[10px] text-text-muted mt-1 leading-normal select-none">{item.desc}</span>
                </button>
              ))}
            </div>

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-text-semi-muted animate-pulse">
                <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-indigo-400">Configuring custom canvas preset...</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Welcome screen */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-6 py-6 text-center animate-slide-in select-none">
            {/* Beautiful radiant glowing circle icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-[16px] bg-green-500/30 scale-120 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 relative z-10">
                <svg className="w-8 h-8 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-foreground-pure tracking-tight">You&apos;re all set, {userName.split(" ")[0]}!</h3>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed mx-auto">
                Onboarding completed successfully. We have configured preset ratios and mockups optimized for your devices. Prepare to create gorgeous application marketing shots!
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="w-full mt-4 inline-flex items-center justify-center py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] text-sm font-extrabold shadow-[0_8px_30px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_40px_rgba(99,102,241,0.4)] transition-all duration-300 cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
