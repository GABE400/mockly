"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import SignOutButton from "../../(protected)/dashboard/sign-out-button";

interface AdminUser {
  name: string;
  email: string;
}

interface StatMetrics {
  totalUsers: number;
  totalMockups: number;
  totalProSubscribers: number;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  createdAt: string;
  mockupCount: number;
}

interface MockupRecord {
  id: string;
  title: string;
  screenshotUrl: string | null;
  mockupUrl: string | null;
  deviceFrame: string | null;
  createdAt: string;
  userEmail: string;
}

interface AdminDashboardProps {
  adminUser: AdminUser;
  stats: StatMetrics;
  users: UserRecord[];
  mockups: MockupRecord[];
}

export function AdminDashboard({ adminUser, stats, users, mockups }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"users" | "mockups">("users");

  // --- Users Filtering & Search ---
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState<"all" | "free" | "pro">("all");
  const [userSort, setUserSort] = useState<"newest" | "oldest" | "mockups-desc" | "mockups-asc">("newest");

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // 1. Filter by Search Query (Name/Email)
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    // 2. Filter by Plan Tier
    if (userPlanFilter !== "all") {
      result = result.filter((u) => u.plan === userPlanFilter);
    }

    // 3. Sort Results
    result.sort((a, b) => {
      if (userSort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (userSort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (userSort === "mockups-desc") {
        return b.mockupCount - a.mockupCount;
      }
      if (userSort === "mockups-asc") {
        return a.mockupCount - b.mockupCount;
      }
      return 0;
    });

    return result;
  }, [users, userSearch, userPlanFilter, userSort]);

  // --- Mockups Search & Filtering ---
  const [mockupSearch, setMockupSearch] = useState("");
  const [mockupDeviceFilter, setMockupDeviceFilter] = useState("all");

  const filteredMockups = useMemo(() => {
    let result = [...mockups];

    // 1. Filter by User Email or Title
    if (mockupSearch.trim()) {
      const q = mockupSearch.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.userEmail.toLowerCase().includes(q) ||
          (m.title && m.title.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Device Frame
    if (mockupDeviceFilter !== "all") {
      result = result.filter(
        (m) => m.deviceFrame?.toLowerCase() === mockupDeviceFilter.toLowerCase()
      );
    }

    return result;
  }, [mockups, mockupSearch, mockupDeviceFilter]);

  // Pro Plan Conversion Percentage
  const conversionRate = useMemo(() => {
    if (stats.totalUsers === 0) return 0;
    return ((stats.totalProSubscribers / stats.totalUsers) * 100).toFixed(1);
  }, [stats]);

  // Get distinct devices for dropdown filter
  const distinctDevices = useMemo(() => {
    const devices = new Set<string>();
    mockups.forEach((m) => {
      if (m.deviceFrame) devices.add(m.deviceFrame);
    });
    return Array.from(devices);
  }, [mockups]);

  // Active user thumbnail preview lightbox modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300">
      
      {/* Background Glow Blobs */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[400px] rounded-full blur-[120px] pointer-events-none z-0 opacity-30" 
        style={{
          background: "radial-gradient(circle, var(--glow-blob-1) 0%, var(--glow-blob-2) 40%, transparent 80%)"
        }}
      />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20" 
        style={{
          backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/50 backdrop-blur-md py-4 px-6 md:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-all">
              <Image 
                src="/logo.png" 
                alt="Muckly Logo" 
                width={30} 
                height={30} 
                className="rounded-lg shadow-lg border border-border-subtle object-cover"
              />
              <span className="text-lg font-bold tracking-tight text-foreground-pure">
                Muckly
              </span>
            </Link>
            <span className="h-4 w-px bg-border-medium hidden sm:inline-block" />
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2.5 mr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-xs font-black text-white shadow-inner border border-white/10 select-none">
                AD
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-foreground-pure leading-none">{adminUser.name}</span>
                <span className="text-[10px] text-rose-400 font-semibold leading-none mt-1">Administrator</span>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-14">
        
        {/* Back Link to User Console */}
        <div className="mb-6 text-left">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-foreground-pure transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard Console
          </Link>
        </div>

        {/* Page Title */}
        <section className="mb-10 text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground-pure leading-tight">
            Administrator Console
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time insights, metrics, conversion aggregates, and assets generated on the platform.
          </p>
        </section>

        {/* Statistics Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Total Users */}
          <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col text-left group hover:border-indigo-500/20 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Users</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <span className="text-3xl font-black text-foreground-pure tracking-tight leading-none">
              {stats.totalUsers}
            </span>
            <span className="text-[10px] text-text-dim mt-2 block">All registered creator accounts</span>
          </div>

          {/* Card 2: Generated Mockups */}
          <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col text-left group hover:border-emerald-500/20 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Mockups Generated</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <span className="text-3xl font-black text-foreground-pure tracking-tight leading-none">
              {stats.totalMockups}
            </span>
            <span className="text-[10px] text-text-dim mt-2 block">Lossless raster asset PNGs exported</span>
          </div>

          {/* Card 3: Pro Subscribers & Conversion */}
          <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col text-left group hover:border-rose-500/20 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Pro Subscriptions</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-foreground-pure tracking-tight leading-none">
                {stats.totalProSubscribers}
              </span>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                {conversionRate}% conv.
              </span>
            </div>
            <span className="text-[10px] text-text-dim mt-2 block">Active recurring billing plan users</span>
          </div>

        </section>

        {/* Dashboard Tabs Selectors */}
        <section className="flex gap-2.5 border-b border-border-subtle pb-px mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 tracking-tight transition-all cursor-pointer ${
              activeTab === "users"
                ? "border-rose-500 text-foreground-pure font-black"
                : "border-transparent text-text-muted hover:text-foreground-pure"
            }`}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("mockups")}
            className={`pb-3 px-4 text-sm font-bold border-b-2 tracking-tight transition-all cursor-pointer ${
              activeTab === "mockups"
                ? "border-rose-500 text-foreground-pure font-black"
                : "border-transparent text-text-muted hover:text-foreground-pure"
            }`}
          >
            Mockup Exports Activity ({mockups.length})
          </button>
        </section>

        {/* TAB 1: USERS SECTION */}
        {activeTab === "users" && (
          <section className="space-y-6">
            
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md text-left">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border-medium bg-bg-card/30 text-xs text-foreground placeholder-text-muted focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
                />
              </div>

              {/* Filtering & Sorting selections */}
              <div className="flex flex-wrap gap-2.5 items-center justify-start sm:justify-end">
                
                {/* Plan Dropdown */}
                <div className="flex items-center gap-1.5 border border-border-medium bg-bg-card/20 rounded-full px-3 py-1.5 text-xs text-left">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Plan:</span>
                  <select
                    value={userPlanFilter}
                    onChange={(e) => setUserPlanFilter(e.target.value as any)}
                    className="bg-transparent text-foreground-pure font-semibold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all" className="bg-background">All Plans</option>
                    <option value="free" className="bg-background">Free Tier</option>
                    <option value="pro" className="bg-background text-indigo-400 font-bold">Pro Tier</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 border border-border-medium bg-bg-card/20 rounded-full px-3 py-1.5 text-xs text-left">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sort:</span>
                  <select
                    value={userSort}
                    onChange={(e) => setUserSort(e.target.value as any)}
                    className="bg-transparent text-foreground-pure font-semibold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="newest" className="bg-background">Newest Registered</option>
                    <option value="oldest" className="bg-background">Oldest Registered</option>
                    <option value="mockups-desc" className="bg-background">Highest Exports</option>
                    <option value="mockups-asc" className="bg-background">Lowest Exports</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Users Table */}
            <div className="border border-border-medium bg-bg-card/30 backdrop-blur-xs rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-foreground/[0.015]">
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure">Name</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure">Email</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center">Plan</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center">Registered At</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center">Mockup Exports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-foreground/[0.01] transition-colors">
                          <td className="p-4 md:p-5">
                            <div className="font-bold text-foreground-pure tracking-tight">
                              {u.name}
                            </div>
                          </td>
                          <td className="p-4 md:p-5">
                            <span className="text-text-muted select-all font-mono">
                              {u.email}
                            </span>
                          </td>
                          <td className="p-4 md:p-5 text-center">
                            <span className={`inline-flex items-center justify-center font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-full ${
                              u.plan === "pro"
                                ? "bg-indigo-500/15 border border-indigo-500/20 text-indigo-400"
                                : "bg-foreground/[0.04] border border-border-medium text-text-muted"
                            }`}>
                              {u.plan}
                            </span>
                          </td>
                          <td className="p-4 md:p-5 text-center font-medium text-text-semi-muted">
                            {new Date(u.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="p-4 md:p-5 text-center font-bold text-foreground-pure text-sm">
                            {u.mockupCount}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-text-muted select-none">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <svg className="w-8 h-8 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold">No users matching search filters.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

        {/* TAB 2: MOCKUPS SECTION */}
        {activeTab === "mockups" && (
          <section className="space-y-6">
            
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md text-left">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search mockups by creator email or title..."
                  value={mockupSearch}
                  onChange={(e) => setMockupSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border-medium bg-bg-card/30 text-xs text-foreground placeholder-text-muted focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all"
                />
              </div>

              {/* Device filter Dropdown */}
              <div className="flex items-center gap-1.5 border border-border-medium bg-bg-card/20 rounded-full px-3 py-1.5 text-xs text-left w-full sm:w-auto self-start">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Device:</span>
                <select
                  value={mockupDeviceFilter}
                  onChange={(e) => setMockupDeviceFilter(e.target.value)}
                  className="bg-transparent text-foreground-pure font-semibold focus:outline-none cursor-pointer pr-1 w-full sm:w-auto"
                >
                  <option value="all" className="bg-background">All Devices</option>
                  {distinctDevices.map((dev) => (
                    <option key={dev} value={dev} className="bg-background capitalize">{dev}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Mockups Table */}
            <div className="border border-border-medium bg-bg-card/30 backdrop-blur-xs rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle bg-foreground/[0.015]">
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure">Mockup Title</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure">Creator Email</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center">Device Model</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center">Generated Date</th>
                      <th className="p-4 md:p-5 text-sm font-bold text-foreground-pure text-center">Preview Thumbnail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {filteredMockups.length > 0 ? (
                      filteredMockups.map((m) => (
                        <tr key={m.id} className="hover:bg-foreground/[0.01] transition-colors">
                          <td className="p-4 md:p-5">
                            <div className="font-bold text-foreground-pure tracking-tight">
                              {m.title || "Untitled Mockup"}
                            </div>
                          </td>
                          <td className="p-4 md:p-5">
                            <span className="text-text-muted select-all font-mono">
                              {m.userEmail}
                            </span>
                          </td>
                          <td className="p-4 md:p-5 text-center">
                            <span className="capitalize font-semibold text-text-semi-muted bg-foreground/[0.03] border border-border-medium/30 px-2 py-0.5 rounded">
                              {m.deviceFrame || "N/A"}
                            </span>
                          </td>
                          <td className="p-4 md:p-5 text-center font-medium text-text-semi-muted">
                            {new Date(m.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4 md:p-5 text-center">
                            {m.mockupUrl ? (
                              <button
                                onClick={() => setPreviewImage(m.mockupUrl)}
                                className="group relative w-14 h-9 rounded border border-border-medium bg-foreground/[0.02] overflow-hidden cursor-zoom-in inline-block shadow transition-transform duration-200 active:scale-95"
                              >
                                <Image
                                  src={m.mockupUrl}
                                  alt="Mockup Thumbnail"
                                  fill
                                  sizes="56px"
                                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>
                              </button>
                            ) : (
                              <span className="text-text-dim text-[10px] font-semibold italic">No URL</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-text-muted select-none">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <svg className="w-8 h-8 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold">No mockup exports matching search filters.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

      </main>

      {/* Trust & Policy Info */}
      <footer className="text-center text-[10px] text-text-muted leading-relaxed px-4 py-12 select-none border-t border-border-subtle mt-16">
        Muckly Admin Panel Console &copy; {new Date().getFullYear()} Muckly Inc. All rights reserved. 
        Highly confidential. Unauthorized reproduction, scanning, or interception is strictly prohibited.
      </footer>

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in cursor-zoom-out"
        >
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center"
          >
            <img 
              src={previewImage} 
              alt="High resolution mockup preview" 
              className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10 object-contain"
            />
            <div className="mt-4 flex gap-4">
              <a 
                href={previewImage}
                download="muckly-export.png"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold bg-white text-black hover:opacity-90 active:scale-95 transition-all rounded-full px-5 py-2.5 shadow-lg select-none cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Lossless PNG
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
