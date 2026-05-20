import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import OnboardingForm from "./onboarding-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { user } = session;

  // Direct Page-Level Redirection: Block onboarding if complete
  if (user.onboardingComplete) {
    redirect("/dashboard");
  }

  // Safely parse initial onboarding answers
  let initialAnswers: Record<string, any> = {};
  if (user.onboardingAnswers) {
    try {
      initialAnswers = typeof user.onboardingAnswers === "string"
        ? JSON.parse(user.onboardingAnswers)
        : (user.onboardingAnswers as Record<string, any>);
    } catch (e) {
      initialAnswers = {};
    }
  }

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
          background: "radial-gradient(circle, var(--glow-blob-2) 0%, var(--glow-blob-3) 40%, transparent 80%)"
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

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        
        {/* Title Area */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-2 mb-4">
            <Image 
              src="/logo.png" 
              alt="Muckly Logo" 
              width={36} 
              height={36} 
              className="rounded-lg border border-border-subtle object-cover shadow-lg"
            />
            <span className="text-xl font-black tracking-tight text-foreground-pure">
              Muckly
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground-pure tracking-tight">
            Welcome to Muckly, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-xs text-text-muted mt-1.5 max-w-sm leading-relaxed">
            Let&apos;s customize your workspace to ensure you get the absolute best mockup generations for your screenshots.
          </p>
        </div>

        {/* Card containing interactive Onboarding wizard */}
        <div className="border border-border-medium bg-bg-card backdrop-blur-md rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent z-10" />

          {/* Interactive Client Wizard Form */}
          <OnboardingForm userName={user.name} initialAnswers={initialAnswers} />

        </div>

      </div>

    </div>
  );
}
