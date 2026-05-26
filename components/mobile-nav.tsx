"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Only render for active authenticated sessions
  if (!session) return null;

  // Do not show on onboarding screen
  if (pathname === "/onboarding") return null;

  const menuItems = [
    {
      name: "Workspace",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
    },
    {
      name: "Billing",
      href: "/settings/billing",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Support",
      href: "/support",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-4 inset-x-4 z-[120] md:hidden">
      <nav className="w-full bg-bg-card/90 border border-border-medium rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.4)] backdrop-blur-lg flex items-center justify-around py-3.5 px-6 select-none animate-scale-in">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative ${
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400 font-bold scale-105" 
                  : "text-text-muted hover:text-foreground-pure"
              }`}
            >
              {/* Dynamic Highlight Accent Pill Behind Icon */}
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)] dark:shadow-[0_0_10px_#6366f1] animate-pulse" />
              )}
              
              <div className="transition-transform duration-300 active:scale-90">
                {item.icon}
              </div>
              
              <span className="text-[9px] uppercase tracking-wider font-extrabold leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
