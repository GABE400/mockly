"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Playground", href: "/#playground" },
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
    { name: "FAQ", href: "/#faq" },
  ];

  return (
    <>
      {/* Main Navigation Header */}
      <header
        className={`z-50 transition-all duration-300 ease-in-out ${
          isScrolled
            ? "fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl border border-border-medium bg-[var(--header-bg-scrolled)] backdrop-blur-md rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2.5 px-6"
            : "sticky top-0 w-full border-b border-border-subtle bg-[var(--header-bg)] backdrop-blur-md py-4 px-6 md:px-8"
        }`}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          
          {/* Logo & Brand Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-all">
              <Image
                src="/logo.png"
                alt="Muckly Logo"
                width={isScrolled ? 28 : 32}
                height={isScrolled ? 28 : 32}
                className="rounded-lg shadow-lg shadow-indigo-500/10 object-cover border border-border-subtle transition-all duration-300"
              />
              <span className="text-lg md:text-xl font-bold tracking-tight text-foreground-pure">
                Muckly
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`hover:text-foreground-pure transition-colors duration-200 ${
                    isActive ? "text-foreground-pure font-bold" : ""
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions Row */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs md:text-sm font-semibold text-text-semi-muted hover:text-foreground-pure transition-colors duration-200 px-3 py-1.5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings/billing"
                  className="inline-flex items-center justify-center text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-full px-4 py-2"
                >
                  Manage Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  id="nav-login-btn"
                  href="/sign-in"
                  className="text-xs md:text-sm font-medium text-text-semi-muted hover:text-foreground-pure transition-colors duration-200 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  id="nav-signup-btn"
                  href="/sign-up"
                  className="inline-flex items-center justify-center text-xs font-semibold bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-full px-4 py-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions Header Row (Visible on screens < 768px) */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />

            {/* Hamburger Button with dynamic motion */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-1.5 rounded-xl border border-border-medium hover:bg-foreground/[0.04] text-text-muted hover:text-foreground-pure transition-all active:scale-95 cursor-pointer relative z-50"
              aria-label="Toggle mobile navigation menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-1.5">
                <span
                  className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md md:hidden animate-fade-in"
        />
      )}

      {/* Mobile Drawer Slide Down Menu Panel */}
      <div
        className={`fixed inset-x-6 z-50 md:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen
            ? "top-20 opacity-100 scale-100 pointer-events-auto"
            : "top-10 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="w-full border border-border-medium bg-[var(--header-bg-scrolled)] backdrop-blur-lg rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Navigation Menu
            </span>
            <span className="h-px bg-border-subtle mt-2" />
          </div>

          {/* Navigation Links Stacking */}
          <nav className="flex flex-col gap-4 text-left">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-semibold hover:text-foreground-pure transition-colors py-1.5 ${
                    isActive ? "text-foreground-pure pl-2 border-l-2 border-indigo-500" : "text-text-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <span className="h-px bg-border-subtle" />

          {/* Account Credentials / Dashboard buttons */}
          <div className="flex flex-col gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center text-sm font-semibold border border-border-medium hover:bg-bg-card-hover text-foreground-pure rounded-2xl py-3 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings/billing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center text-sm font-bold bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-2xl py-3 cursor-pointer"
                >
                  Manage Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  id="mobile-nav-login-btn"
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center text-sm font-semibold border border-border-medium hover:bg-bg-card-hover text-foreground-pure rounded-2xl py-3 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  id="mobile-nav-signup-btn"
                  href="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center text-sm font-bold bg-foreground text-background hover:opacity-90 active:scale-[0.98] transition-all duration-200 rounded-2xl py-3 cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
