import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Privacy Policy | Muckly",
  description: "Learn how Muckly collects, protects, and manages your personal data and uploaded content.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-text-muted">
            Last updated: March 2026 &bull; Effective date: March 1, 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm md:text-base leading-relaxed text-text-muted">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">1. Introduction</h2>
            <p>
              At Muckly (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to respecting your privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your personal information when you use our website, mockup creation platform, and associated services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">2. Information We Collect</h2>
            <div className="space-y-3 pl-2 text-text-dim">
              <p>
                <strong className="text-foreground-pure">Account Information:</strong> When you register for an account, we collect your name, email address, password hash, and optional profile details.
              </p>
              <p>
                <strong className="text-foreground-pure">Uploaded Assets & Mockups:</strong> We store screenshots, Figma design frames, and image assets that you upload to render your mockups.
              </p>
              <p>
                <strong className="text-foreground-pure">Billing Information:</strong> Payment transactions are handled securely by our Merchant of Record and payment processor, Dodo Payments. We do not store full credit card numbers or sensitive banking details on our servers.
              </p>
              <p>
                <strong className="text-foreground-pure">Usage & Diagnostic Data:</strong> We may collect technical logs, browser type, operating system version, and IP addresses to monitor platform performance and prevent abuse.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">3. How We Use Your Information</h2>
            <p>We process your data for the following purposes:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-text-dim">
              <li>To provide, operate, and maintain the Muckly mockup studio and export features.</li>
              <li>To manage your account, authentication sessions, and subscription status.</li>
              <li>To send essential transactional notifications (password resets, email verifications, billing updates).</li>
              <li>To enforce our terms of service, detect fraud, and secure our infrastructure.</li>
              <li>To provide responsive technical support when requested.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">4. Third-Party Subprocessors</h2>
            <p>We share data with trusted third-party service providers who assist us in operating our platform:</p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-text-dim">
              <li><strong className="text-foreground-pure">Neon (Serverless Postgres):</strong> Primary database hosting and user record storage.</li>
              <li><strong className="text-foreground-pure">ImageKit:</strong> Cloud media storage, image optimization, and CDN delivery for mockup files.</li>
              <li><strong className="text-foreground-pure">Dodo Payments:</strong> Payment processing, recurring subscriptions, invoices, and sales tax compliance.</li>
              <li><strong className="text-foreground-pure">Figma API:</strong> For users who connect Figma URLs to pull design components and canvas snapshots.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">5. Data Retention & Deletion</h2>
            <p>
              We retain your account data and mockup history for as long as your account remains active. When you delete a mockup from your dashboard, the record is removed from our database and the associated media file is purged from our ImageKit storage. You may also request complete account deletion at any time by contacting our support team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">6. Cookies & Client-Side Storage</h2>
            <p>
              We use secure, HTTP-only cookies for authentication session management. We also use browser local storage to temporarily preserve user interface preferences and seamless upgrade checkouts (such as intent across sign-up and onboarding flows). We do not sell your personal data or track you across unrelated third-party websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">7. Security Measures</h2>
            <p>
              We implement industry-standard encryption in transit (TLS/HTTPS) and at rest, secure password hashing, and role-based access controls to safeguard your personal data and creative assets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">8. Your Rights</h2>
            <p>
              Depending on your location (such as under the GDPR or CCPA), you may have rights to access, correct, export, or delete your personal data. To exercise any of these rights, please email us with your request.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground-pure tracking-tight">9. Contact Us</h2>
            <p>
              For privacy-related inquiries, requests, or questions, please email <a href="mailto:support@usemuckly.com" className="text-indigo-400 font-semibold hover:underline">support@usemuckly.com</a> or visit our <Link href="/support" className="text-indigo-400 font-semibold hover:underline">Support Page</Link>.
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
            <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150 text-foreground-pure font-medium">Privacy Policy</Link>
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
