import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Terms of Service | Muckly",
  description: "Read the Terms of Service for Muckly mockup generation and studio tools.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-dm-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] -z-10 pointer-events-none" />

      <Navbar />

      <main className="relative z-10 mx-auto max-w-4xl px-6 md:px-8 py-28 md:py-36">
        {/* Header */}
        <div className="mb-12 border-b border-border-subtle pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-4">
            Legal & Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground-pure mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-text-muted">
            Last updated: March 2026 &bull; Effective date: March 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm md:text-base leading-relaxed text-text-muted">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">1. Agreement to Terms</h2>
            <p>
              By accessing or using Muckly (&quot;Service&quot;), provided by Muckly Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">2. Description of the Service</h2>
            <p>
              Muckly is a design and marketing productivity platform that allows creators, developers, and teams to transform screenshots, Figma frames, and application visuals into studio-grade device mockups, high-resolution exports, and shareable marketing assets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">3. User Accounts & Security</h2>
            <p>
              When you create an account with Muckly, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately at <a href="mailto:support@usemuckly.com" className="text-indigo-400 hover:underline">support@usemuckly.com</a> if you discover unauthorized access to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">4. Subscriptions, Payments & Cancellations</h2>
            <p>
              Muckly provides free features as well as premium paid tiers (&quot;Starter&quot; and &quot;Pro&quot;). Billing is managed securely via our payment partner, Dodo Payments.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-text-dim">
              <li><strong className="text-foreground-pure">Billing Cycle:</strong> Subscriptions are billed on a recurring monthly or annual basis depending on your selection at checkout.</li>
              <li><strong className="text-foreground-pure">Cancellations:</strong> You may cancel your subscription at any time via your account billing settings. Upon cancellation, your paid tier features remain active until the end of your current paid billing period, after which your account reverts to the free tier.</li>
              <li><strong className="text-foreground-pure">Refunds:</strong> Unless required by applicable law, payments are non-refundable. If you experience technical defects or billing errors, please contact our support team.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">5. User Content & Intellectual Property</h2>
            <p>
              You retain all ownership rights and intellectual property rights in the assets, screenshots, images, and content you upload to Muckly. You grant Muckly a worldwide, non-exclusive license solely to host, process, and render your content to provide the mockup creation and export functionality.
            </p>
            <p>
              Muckly and its licensors retain all rights, title, and interest in the Muckly platform, device frame templates, software code, branding, and logos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">6. Acceptable Use Policy</h2>
            <p>You agree not to use Muckly to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-text-dim">
              <li>Upload or distribute content that is defamatory, obscene, harassing, or infringes on third-party intellectual property.</li>
              <li>Attempt to reverse-engineer, decompile, or compromise the security or availability of our infrastructure.</li>
              <li>Abuse export quotas, programmatic API rate limits, or CDN asset hosting bandwidth.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or organization.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">7. Third-Party Services</h2>
            <p>
              Muckly integrates with third-party providers including Figma (for frame syncing), ImageKit (for content delivery and image processing), and Dodo Payments (for payment handling). Your use of those services is governed by their respective terms of service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">8. Disclaimer of Warranties</h2>
            <p>
              Muckly is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">9. Limitation of Liability</h2>
            <p>
              In no event shall Muckly Inc., its directors, employees, or partners be liable for any indirect, incidental, special, consequential, or punitive damages arising from your access to or use of (or inability to access or use) the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please reach out to us at <a href="mailto:support@usemuckly.com" className="text-indigo-400 font-semibold hover:underline">support@usemuckly.com</a> or visit our <Link href="/support" className="text-indigo-400 font-semibold hover:underline">Support Page</Link>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 md:px-8 border-t border-border-subtle/50 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="max-w-sm flex flex-col gap-4 text-left">
            <Link href="/" className="flex items-center gap-3 group">
              <Image 
                src="/logo.png" 
                alt="Muckly Logo" 
                width={24} 
                height={24} 
                className="rounded-md object-cover border border-border-subtle"
              />
              <span className="text-lg font-bold tracking-tight text-foreground-pure">Muckly</span>
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
            <Link href="/terms" className="hover:text-white transition-colors duration-150 text-foreground-pure font-medium">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-text-dim">
          <div>&copy; {new Date().getFullYear()} Muckly Inc. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Built by</span>
              <a 
                href="https://barakis.com/" 
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
