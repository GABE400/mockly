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
  plan: "free" | "starter" | "pro";
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
  const [userPlanFilter, setUserPlanFilter] = useState<"all" | "free" | "starter" | "pro">("all");
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

  // --- Interactive SVG Growth Chart Aggregations ---
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const { chartData, maxVal } = useMemo(() => {
    // Generate dates for the last 7 days (including today)
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const firstDayTime = days[0].getTime();
    let baseTotalUsers = 0;
    let baseProUsers = 0;

    // Users registered before our 7 day window
    users.forEach((u) => {
      const t = new Date(u.createdAt).getTime();
      if (t < firstDayTime) {
        baseTotalUsers++;
        if (u.plan === "pro") {
          baseProUsers++;
        }
      }
    });

    const dailySignups = Array(7).fill(0);
    const dailyProSignups = Array(7).fill(0);

    // Grouping registrations by day
    users.forEach((u) => {
      const t = new Date(u.createdAt).getTime();
      for (let i = 0; i < 7; i++) {
        const start = days[i].getTime();
        const end = start + 24 * 60 * 60 * 1000;
        if (t >= start && t < end) {
          dailySignups[i]++;
          if (u.plan === "pro") {
            dailyProSignups[i]++;
          }
          break;
        }
      }
    });

    const dataList = [];
    let currentTotal = baseTotalUsers;
    let currentPro = baseProUsers;

    for (let i = 0; i < 7; i++) {
      currentTotal += dailySignups[i];
      currentPro += dailyProSignups[i];

      const label = days[i].toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      dataList.push({
        label,
        totalUsers: currentTotal,
        proUsers: currentPro,
      });
    }

    const max = Math.max(...dataList.map((d) => d.totalUsers), 5);
    return { chartData: dataList, maxVal: max };
  }, [users]);

  // Chart configuration bounds
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 600 - paddingLeft - paddingRight; // 535
  const chartHeight = 240 - paddingTop - paddingBottom; // 180

  const getCoordinates = (val: number, index: number) => {
    const x = paddingLeft + (index / 6) * chartWidth;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y };
  };

  const totalPoints = useMemo(() => chartData.map((d, i) => getCoordinates(d.totalUsers, i)), [chartData, maxVal]);
  const proPoints = useMemo(() => chartData.map((d, i) => getCoordinates(d.proUsers, i)), [chartData, maxVal]);

  const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) * 0.4;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) * 0.6;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const getAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    const linePath = getBezierPath(points);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  };

  const totalUsersPath = useMemo(() => getBezierPath(totalPoints), [totalPoints]);
  const totalUsersAreaPath = useMemo(() => getAreaPath(totalPoints), [totalPoints]);
  const proUsersPath = useMemo(() => getBezierPath(proPoints), [proPoints]);
  const proUsersAreaPath = useMemo(() => getAreaPath(proPoints), [proPoints]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const step = maxVal / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return Array.from(new Set(ticks));
  }, [maxVal]);

  // --- SVG Device Popularity Bar Chart ---
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const deviceCounts = useMemo(() => {
    const counts = { iphone: 0, pixel: 0, macbook: 0 };
    mockups.forEach((m) => {
      const dev = (m.deviceFrame || "").toLowerCase();
      if (dev.includes("iphone") || dev.includes("phone")) {
        counts.iphone++;
      } else if (dev.includes("pixel")) {
        counts.pixel++;
      } else {
        counts.macbook++;
      }
    });

    const data = [
      { name: "iPhone 16 Pro", count: counts.iphone },
      { name: "Pixel 9 Pro", count: counts.pixel },
      { name: "MacBook Pro", count: counts.macbook },
    ];

    const max = Math.max(...data.map((d) => d.count), 5);
    return { data, maxBarVal: max };
  }, [mockups]);

  // Bar Chart Configuration Bounds
  const barPaddingLeft = 40;
  const barPaddingRight = 20;
  const barPaddingTop = 25;
  const barPaddingBottom = 35;
  const barChartWidth = 400 - barPaddingLeft - barPaddingRight; // 340
  const barChartHeight = 240 - barPaddingTop - barPaddingBottom; // 180

  const barWidth = 44;
  const barGap = (barChartWidth - barWidth * 3) / 4;

  const barYTicks = useMemo(() => {
    const ticks = [];
    const step = deviceCounts.maxBarVal / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return Array.from(new Set(ticks));
  }, [deviceCounts.maxBarVal]);

  // --- Data Export Utilities ---
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportUsersCSV = () => {
    const headers = ["ID", "Name", "Email", "Plan", "Registered At", "Mockup Count"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.plan,
      u.createdAt,
      u.mockupCount,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csvContent, "muckly-users-export.csv", "text/csv;charset=utf-8;");
  };

  const exportUsersJSON = () => {
    const jsonContent = JSON.stringify(filteredUsers, null, 2);
    downloadFile(jsonContent, "muckly-users-export.json", "application/json;charset=utf-8;");
  };

  const exportMockupsCSV = () => {
    const headers = ["ID", "Title", "Creator Email", "Device Model", "Screenshot URL", "Mockup URL", "Generated At"];
    const rows = filteredMockups.map((m) => [
      m.id,
      `"${(m.title || "Untitled").replace(/"/g, '""')}"`,
      m.userEmail,
      m.deviceFrame || "N/A",
      m.screenshotUrl || "",
      m.mockupUrl || "",
      m.createdAt,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadFile(csvContent, "muckly-mockups-export.csv", "text/csv;charset=utf-8;");
  };

  const exportMockupsJSON = () => {
    const jsonContent = JSON.stringify(filteredMockups, null, 2);
    downloadFile(jsonContent, "muckly-mockups-export.json", "application/json;charset=utf-8;");
  };

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
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
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

        {/* Visual SVG Analytics Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Growth Analytics Curve */}
          <div className="lg:col-span-2 border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-6 relative shadow-xl flex flex-col text-left group hover:border-indigo-500/20 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground-pure tracking-tight">Platform Growth Timeline</h3>
              <p className="text-[11px] text-text-dim">Cumulative creator registrations vs. Pro subscribers (last 7 days)</p>
            </div>

            <div className="relative w-full h-[240px]">
              <svg viewBox="0 0 600 240" className="w-full h-full select-none" preserveAspectRatio="none">
                <defs>
                  {/* Glowing translucent area gradients */}
                  <linearGradient id="rose-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="indigo-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Ticks */}
                {yTicks.map((tick, i) => {
                  const y = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
                  return (
                    <g key={i} className="opacity-60 transition-all duration-300">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={paddingLeft + chartWidth}
                        y2={y}
                        stroke="var(--grid-line)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 10}
                        y={y + 3.5}
                        textAnchor="end"
                        className="fill-text-dim text-[9px] font-mono font-semibold"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Ticks */}
                {chartData.map((d, i) => {
                  const x = paddingLeft + (i / 6) * chartWidth;
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={paddingTop + chartHeight}
                        stroke="var(--grid-line)"
                        strokeWidth="0.5"
                        className="opacity-15"
                      />
                      <text
                        x={x}
                        y={paddingTop + chartHeight + 16}
                        textAnchor="middle"
                        className="fill-text-muted text-[9px] font-bold tracking-tight"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}

                {/* Curve Translucent Fills */}
                <path d={totalUsersAreaPath} fill="url(#rose-area-grad)" className="transition-all duration-500 ease-in-out" />
                <path d={proUsersAreaPath} fill="url(#indigo-area-grad)" className="transition-all duration-500 ease-in-out" />

                {/* Bezier Stroke Curves */}
                <path
                  d={totalUsersPath}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
                <path
                  d={proUsersPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />

                {/* Guide vertical dashed line when hovering */}
                {hoveredPointIndex !== null && (
                  <line
                    x1={totalPoints[hoveredPointIndex].x}
                    y1={paddingTop}
                    x2={totalPoints[hoveredPointIndex].x}
                    y2={paddingTop + chartHeight}
                    stroke="var(--border-medium)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Static Anchor Circles (Highlighted on hover) */}
                {chartData.map((_, i) => {
                  const isHovered = hoveredPointIndex === i;
                  return (
                    <g key={i}>
                      <circle
                        cx={totalPoints[i].x}
                        cy={totalPoints[i].y}
                        r={isHovered ? 6 : 3.5}
                        fill="#f43f5e"
                        stroke="var(--bg-card)"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={proPoints[i].x}
                        cy={proPoints[i].y}
                        r={isHovered ? 6 : 3.5}
                        fill="#6366f1"
                        stroke="var(--bg-card)"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* Invisible trigger Zones */}
                {chartData.map((_, i) => {
                  const triggerW = chartWidth / 6;
                  const triggerX = totalPoints[i].x - triggerW / 2;
                  return (
                    <rect
                      key={i}
                      x={triggerX}
                      y={paddingTop}
                      width={triggerW}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Floating Responsive Tooltip */}
              {hoveredPointIndex !== null && (
                <div 
                  className="absolute -translate-x-1/2 -translate-y-full bg-bg-card/90 border border-border-medium rounded-2xl p-3 shadow-2xl z-20 pointer-events-none text-xs text-left animate-fade-in backdrop-blur-md min-w-[130px]"
                  style={{
                    left: `${(totalPoints[hoveredPointIndex].x / 600) * 100}%`,
                    top: `${((Math.min(totalPoints[hoveredPointIndex].y, proPoints[hoveredPointIndex].y) - 14) / 240) * 100}%`
                  }}
                >
                  <div className="font-bold text-foreground-pure mb-1">
                    {chartData[hoveredPointIndex].label}
                  </div>
                  <div className="flex items-center gap-1.5 text-text-semi-muted mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>Total Creators: <strong>{chartData[hoveredPointIndex].totalUsers}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-semi-muted">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    <span>Pro Subscribers: <strong>{chartData[hoveredPointIndex].proUsers}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart Device Distribution */}
          <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-6 relative shadow-xl flex flex-col text-left group hover:border-pink-500/20 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
            <div className="mb-4">
              <h3 className="text-sm font-bold text-foreground-pure tracking-tight">Template Popularity</h3>
              <p className="text-[11px] text-text-dim">Mockup assets exported by device outline</p>
            </div>

            <div className="relative w-full h-[240px]">
              <svg viewBox="0 0 400 240" className="w-full h-full select-none" preserveAspectRatio="none">
                <defs>
                  {/* Glowing vertical bar linear gradients */}
                  <linearGradient id="bar-iphone-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="bar-pixel-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="bar-macbook-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Ticks */}
                {barYTicks.map((tick, i) => {
                  const y = barPaddingTop + barChartHeight - (tick / deviceCounts.maxBarVal) * barChartHeight;
                  return (
                    <g key={i} className="opacity-60 transition-all duration-300">
                      <line
                        x1={barPaddingLeft}
                        y1={y}
                        x2={barPaddingLeft + barChartWidth}
                        y2={y}
                        stroke="var(--grid-line)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={barPaddingLeft - 10}
                        y={y + 3.5}
                        textAnchor="end"
                        className="fill-text-dim text-[9px] font-mono font-semibold"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Columns */}
                {deviceCounts.data.map((d, i) => {
                  const x = barPaddingLeft + barGap + i * (barWidth + barGap);
                  const valHeight = (d.count / deviceCounts.maxBarVal) * barChartHeight;
                  const y = barPaddingTop + barChartHeight - valHeight;
                  const isHovered = hoveredBarIndex === i;

                  // Pick gradient definition based on index
                  const gradId = i === 0 ? "url(#bar-iphone-grad)" : i === 1 ? "url(#bar-pixel-grad)" : "url(#bar-macbook-grad)";

                  return (
                    <g key={i}>
                      {/* Interactive Bar capsule */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(valHeight, 4)} // Ensure at least tiny pill shows if count is 0
                        rx="6"
                        ry="6"
                        fill={gradId}
                        className="transition-all duration-300 cursor-pointer shadow-md"
                        style={{
                          filter: isHovered ? "brightness(1.1) drop-shadow(0 4px 12px rgba(236,72,153,0.15))" : "none"
                        }}
                        onMouseEnter={() => setHoveredBarIndex(i)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />
                      {/* Axis labels */}
                      <text
                        x={x + barWidth / 2}
                        y={barPaddingTop + barChartHeight + 16}
                        textAnchor="middle"
                        className="fill-text-muted text-[9px] font-bold tracking-tight"
                      >
                        {d.name.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Bar Tooltip */}
              {hoveredBarIndex !== null && (
                <div 
                  className="absolute -translate-x-1/2 -translate-y-full bg-bg-card/90 border border-border-medium rounded-2xl p-3 shadow-2xl z-20 pointer-events-none text-xs text-left animate-fade-in backdrop-blur-md min-w-[120px]"
                  style={{
                    left: `${((barPaddingLeft + barGap + hoveredBarIndex * (barWidth + barGap) + barWidth / 2) / 400) * 100}%`,
                    top: `${((barPaddingTop + barChartHeight - (deviceCounts.data[hoveredBarIndex].count / deviceCounts.maxBarVal) * barChartHeight - 14) / 240) * 100}%`
                  }}
                >
                  <div className="font-bold text-foreground-pure mb-1">
                    {deviceCounts.data[hoveredBarIndex].name}
                  </div>
                  <div className="flex items-center gap-1.5 text-text-semi-muted">
                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                    <span>Exports: <strong>{deviceCounts.data[hoveredBarIndex].count}</strong></span>
                  </div>
                </div>
              )}
            </div>
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
                    <option value="starter" className="bg-background text-purple-400 font-bold">Starter Tier</option>
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

                {/* Export Actions */}
                <div className="flex items-center gap-1 border border-border-medium bg-bg-card/20 rounded-full px-2.5 py-1 text-xs select-none">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Export:</span>
                  <button
                    onClick={exportUsersCSV}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-text-muted hover:text-foreground-pure hover:bg-foreground/[0.04] transition-all cursor-pointer"
                    title="Export filtered users to CSV"
                  >
                    CSV
                  </button>
                  <span className="w-px h-3 bg-border-medium" />
                  <button
                    onClick={exportUsersJSON}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-text-muted hover:text-foreground-pure hover:bg-foreground/[0.04] transition-all cursor-pointer"
                    title="Export filtered users to JSON"
                  >
                    JSON
                  </button>
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
                                : u.plan === "starter"
                                  ? "bg-purple-500/15 border border-purple-500/20 text-purple-400"
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

              {/* Filters and Actions */}
              <div className="flex flex-wrap gap-2.5 items-center justify-start sm:justify-end">
                
                {/* Device filter Dropdown */}
                <div className="flex items-center gap-1.5 border border-border-medium bg-bg-card/20 rounded-full px-3 py-1.5 text-xs text-left">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Device:</span>
                  <select
                    value={mockupDeviceFilter}
                    onChange={(e) => setMockupDeviceFilter(e.target.value)}
                    className="bg-transparent text-foreground-pure font-semibold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all" className="bg-background">All Devices</option>
                    {distinctDevices.map((dev) => (
                      <option key={dev} value={dev} className="bg-background capitalize">{dev}</option>
                    ))}
                  </select>
                </div>

                {/* Export Actions */}
                <div className="flex items-center gap-1 border border-border-medium bg-bg-card/20 rounded-full px-2.5 py-1 text-xs select-none">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Export:</span>
                  <button
                    onClick={exportMockupsCSV}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-text-muted hover:text-foreground-pure hover:bg-foreground/[0.04] transition-all cursor-pointer"
                    title="Export filtered mockups to CSV"
                  >
                    CSV
                  </button>
                  <span className="w-px h-3 bg-border-medium" />
                  <button
                    onClick={exportMockupsJSON}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-text-muted hover:text-foreground-pure hover:bg-foreground/[0.04] transition-all cursor-pointer"
                    title="Export filtered mockups to JSON"
                  >
                    JSON
                  </button>
                </div>

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

      <footer className="text-center text-[10px] text-text-muted leading-relaxed px-4 py-12 select-none border-t border-border-subtle mt-16 flex flex-col items-center gap-1.5">
        <div>
          Muckly Admin Panel Console &copy; {new Date().getFullYear()} Muckly Inc. All rights reserved.
        </div>
        <div className="flex items-center gap-1.5 text-text-dim justify-center">
          <span>Powered by</span>
          <a 
            href="https://www.techadotech.com/" 
            className="text-text-muted hover:text-indigo-400 hover:underline transition-colors duration-150 font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Techado Tech
          </a>
          <span className="opacity-40">&middot;</span>
          <span>Highly confidential. Unauthorized reproduction, scanning, or interception is strictly prohibited.</span>
        </div>
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
