"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface BillingClientProps {
  plan: "free" | "pro";
  status: string | null;
  currentPeriodEnd: string | null;
  usageCount: number;
}

export function BillingClient({ plan, status, currentPeriodEnd, usageCount }: BillingClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setMessage(null);

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
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your Muckly Pro subscription? You will lose unlimited exports and high-res renders immediately.")) {
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
              {plan === "pro" ? "Mockup Pro Plan" : "Free Starter Plan"}
            </h2>
            <p className="text-xs text-text-muted mt-1">
              {plan === "pro" 
                ? "Enjoying unlimited 4K PNG exports and dynamic bezel controls." 
                : "Limited to 5 exports per calendar month."}
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Price</span>
            <div className="flex items-baseline gap-0.5 text-foreground-pure mt-1">
              <span className="text-3xl font-black">{plan === "pro" ? "$9" : "$0"}</span>
              <span className="text-xs text-text-muted">/mo</span>
            </div>
          </div>
        </div>

        {/* Subscription Detail Table */}
        <div className="py-6 flex flex-col gap-4 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Subscription Status</span>
            <span className={`font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 rounded-full ${
              plan === "pro" && status === "active"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : plan === "pro"
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-foreground/[0.04] border border-border-medium text-text-muted"
            }`}>
              {plan === "pro" ? status || "active" : "free"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Next Renewal / Billing Date</span>
            <span className="font-semibold text-foreground-pure">{plan === "pro" ? formattedDate : "N/A"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-muted font-medium">Monthly Exports Quota</span>
            <span className="font-semibold text-foreground-pure">
              {plan === "pro" ? "Unlimited (∞)" : `${usageCount} / 5 used`}
            </span>
          </div>
        </div>

        {/* Dynamic Upgrade / Cancel Button Action Area */}
        <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row gap-3 justify-end items-center">
          {plan === "free" ? (
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-95 transition-all text-white rounded-full px-6 py-3 shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer select-none"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Secure Checkout...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade to Pro — $9/mo
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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

      {/* Trust & Policy Info */}
      <div className="text-center text-[10px] text-text-muted leading-relaxed px-4">
        Mockly Pro billing is securely handled via Dodo Payments. Need help? Contact Muckly Billing support at{" "}
        <a href="mailto:support@muckly.com" className="text-indigo-400 hover:underline">support@muckly.com</a>.
        Your subscription can be upgraded or cancelled at any time without hidden fees.
      </div>
      
    </div>
  );
}
