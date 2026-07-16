"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface BillingClientProps {
  plan: "free" | "starter" | "pro";
  status: string | null;
  currentPeriodEnd: string | null;
  usageCount: number;
}

export function BillingClient({ plan, status, currentPeriodEnd, usageCount }: BillingClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpgrade = async (selectedPlan: "starter" | "pro", selectedBillingPeriod: "monthly" | "annual") => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billingPeriod: selectedBillingPeriod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      // Redirect immediately to secure Dodo Payments portal
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your Muckly subscription? You will lose higher export limits and premium features immediately.")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel subscription.");
      }

      setMessage({ type: "success", text: data.message });
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = currentPeriodEnd 
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "N/A";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 text-left">
      
      {/* Action Notifications */}
      {message && (
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fade-in ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Glassmorphic Billing Card */}
      <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
        
        {/* Glowing Background Blob */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border-subtle">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Current Plan</span>
            <h2 className="text-2xl font-black text-foreground-pure tracking-tight capitalize">
              {plan === "pro" ? "Mockup Pro Plan" : plan === "starter" ? "Mockup Starter Plan" : "Free Plan"}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {plan === "pro" 
                ? "Enjoying unlimited 4K PNG exports and dynamic bezel controls." 
                : plan === "starter"
                  ? "Enjoying 30 exports per month, no watermarks, and high-res screenshot mockups."
                  : "Limited to 5 exports per calendar month."}
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Price</span>
            <div className="flex items-baseline gap-0.5 text-foreground-pure mt-1">
              <span className="text-3xl font-black">
                {plan === "pro" ? "$9" : plan === "starter" ? "$4" : "$0"}
              </span>
              <span className="text-xs text-text-muted">/mo</span>
            </div>
          </div>
        </div>

        {/* Subscription Detail Table */}
        <div className="py-6 flex flex-col gap-4 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Subscription Status</span>
            <span className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
              plan !== "free" && status === "active"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : plan !== "free"
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-foreground/[0.04] border border-border-medium text-text-muted"
            }`}>
              {plan !== "free" ? status || "active" : "free"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Next Renewal / Billing Date</span>
            <span className="font-semibold text-foreground-pure">{plan !== "free" ? formattedDate : "N/A"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Monthly Exports Quota</span>
            <span className="font-semibold text-foreground-pure">
              {plan === "pro" ? "Unlimited (∞)" : plan === "starter" ? `${usageCount} / 30 used` : `${usageCount} / 5 used`}
            </span>
          </div>
        </div>

        {/* Dynamic Upgrade / Cancel Button Action Area */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row gap-3 justify-end items-center">
          {plan === "free" ? (
            <div className="text-xs text-text-muted">
              Select one of the plans below to upgrade your account.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {plan === "starter" && (
                <button
                  onClick={() => handleUpgrade("pro", "monthly")}
                  disabled={isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:opacity-90 active:scale-95 transition-all rounded-full px-6 py-3 cursor-pointer select-none"
                >
                  Upgrade to Pro ($9/mo)
                </button>
              )}
              <a
                href="https://customer.dodopayments.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold bg-foreground text-background hover:opacity-90 active:scale-95 transition-all rounded-full px-6 py-3 cursor-pointer select-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Update Payment Details
              </a>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 transition-all text-rose-400 rounded-full px-6 py-3 disabled:opacity-50 cursor-pointer select-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Grid Options */}
      {plan === "free" && (
        <div className="mt-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground-pure">Available Upgrades</h3>
            
            {/* Billing Period Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-foreground/[0.03] border border-border-medium rounded-full text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setBillingPeriod("monthly")}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer select-none ${
                  billingPeriod === "monthly"
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "text-text-muted hover:text-foreground-pure"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod("annual")}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer select-none ${
                  billingPeriod === "annual"
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "text-text-muted hover:text-foreground-pure"
                }`}
              >
                Annual (-33%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starter Plan Card */}
            <div className="border border-border-medium bg-bg-card/30 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
              <div>
                <h4 className="text-base font-bold text-foreground-pure">Muckly Starter</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Perfect for casual creators needing watermark-free, standard resolution exports.
                </p>
                <div className="flex items-baseline gap-0.5 text-foreground-pure my-4">
                  <span className="text-2xl font-black">{billingPeriod === "annual" ? "$3" : "$4"}</span>
                  <span className="text-xs text-text-muted">/mo {billingPeriod === "annual" && "(billed annually)"}</span>
                </div>
                <ul className="text-[11px] text-text-semi-muted space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>30 exports per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No watermarks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Standard mobile frames</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleUpgrade("starter", billingPeriod)}
                disabled={isLoading}
                className="w-full bg-foreground text-background hover:opacity-90 active:scale-95 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 select-none font-sans"
              >
                Upgrade to Starter
              </button>
            </div>

            {/* Pro Plan Card */}
            <div className="border border-indigo-500/20 bg-bg-card/50 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all relative">
              <div className="absolute top-3 right-3 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-indigo-400">
                Most Popular
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground-pure">Muckly Pro</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  For professional designers and creators who need unlimited exports, 3D tilt, and premium finishes.
                </p>
                <div className="flex items-baseline gap-0.5 text-foreground-pure my-4">
                  <span className="text-2xl font-black">{billingPeriod === "annual" ? "$6" : "$9"}</span>
                  <span className="text-xs text-text-muted">/mo {billingPeriod === "annual" && "(billed annually)"}</span>
                </div>
                <ul className="text-[11px] text-text-semi-muted space-y-2 mb-6 text-left">
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-bold text-foreground-pure">Unlimited exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Premium titanium finishes & 3D tilt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No watermarks & commercial usage</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => handleUpgrade("pro", billingPeriod)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold py-2.5 rounded-xl text-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 select-none shadow-md shadow-indigo-500/10"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Policy Info */}
      <div className="text-center text-[10px] text-text-muted leading-relaxed px-4">
        Muckly billing is securely handled via Dodo Payments. Need help? Contact Muckly Billing support at{" "}
        <a href="mailto:support@muckly.com" className="text-indigo-400 hover:underline">support@muckly.com</a>.
        Your subscription can be upgraded or cancelled at any time without hidden fees.
      </div>
      
    </div>
  );
}
