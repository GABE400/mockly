"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  useNodesState,
  Background,
  BackgroundVariant,
  Node,
  ReactFlowProvider,
  NodeResizer,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Background Preset Definitions
export const BACKGROUND_PRESETS = [
  { id: "sunset", name: "Sunset Glow", style: "linear-gradient(135deg, #ff5e62 0%, #ff9966 100%)" },
  { id: "ocean", name: "Ocean Breeze", style: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" },
  { id: "lavender", name: "Midnight Lavender", style: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "emerald", name: "Emerald Aura", style: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { id: "cyberpunk", name: "Cyberpunk Neon", style: "linear-gradient(135deg, #f80759 0%, #bc4e9c 100%)" },
  { id: "aurora", name: "Cosmic Aurora", style: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  
  // Solids
  { id: "slate", name: "Slate Solid", style: "#334155" },
  { id: "rose", name: "Rose Solid", style: "#be123c" },
  { id: "amber", name: "Amber Solid", style: "#b45309" },
  { id: "teal", name: "Teal Solid", style: "#0f766e" },
  { id: "violet", name: "Violet Solid", style: "#6d28d9" },
  { id: "zinc", name: "Zinc Solid", style: "#3f3f46" },
  { id: "white", name: "Pure White", style: "#ffffff" },
  { id: "black", name: "Pure Black", style: "#000000" },

  // Meshes
  { id: "candy", name: "Candy Floss Mesh", style: "radial-gradient(at 10% 20%, rgba(254, 240, 138, 0.4) 0px, transparent 50%), radial-gradient(at 90% 10%, rgba(253, 164, 175, 0.5) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(165, 180, 252, 0.5) 0px, transparent 50%), #ffffff" },
  { id: "nebula", name: "Nebula Dusk Mesh", style: "radial-gradient(at 10% 10%, rgba(79, 70, 229, 0.5) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(219, 39, 119, 0.5) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(59, 130, 246, 0.3) 0px, transparent 50%), #0c0f1d" },
  { id: "retrowave", name: "Retro Wave Mesh", style: "radial-gradient(at 0% 100%, rgba(236, 72, 153, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(20, 184, 166, 0.4) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.4) 0px, transparent 50%), #030303" },
  { id: "forest", name: "Forest Sunset Mesh", style: "radial-gradient(at 20% 0%, rgba(251, 146, 60, 0.5) 0px, transparent 50%), radial-gradient(at 80% 100%, rgba(16, 185, 129, 0.4) 0px, transparent 50%), #0d1e1a" }
];

export const DEVICE_FRAMES = [
  { id: "iPhone 17 Pro", name: "iPhone 17 Pro" },
  { id: "iPhone 16 Pro", name: "iPhone 16 Pro" },
  { id: "iPhone 15 Pro", name: "iPhone 15 Pro" },
  { id: "iPhone 14", name: "iPhone 14" },
  { id: "iPhone 13", name: "iPhone 13" },
  { id: "Google Pixel 9 Pro", name: "Google Pixel 9 Pro" },
  { id: "Samsung Galaxy S24", name: "Samsung Galaxy S24" },
  { id: "Sony Xperia 1 VI", name: "Sony Xperia 1 VI" },
];

export const FRAME_COLORS = [
  { id: "Dark", name: "Titanium Dark", hex: "#1e1e24" },
  { id: "Light", name: "Titanium Silver", hex: "#e2e8f0" },
  { id: "Gold", name: "Titanium Gold", hex: "#d4af37" },
  { id: "Space Black", name: "Space Black", hex: "#0d0d11" },
  { id: "Rose Gold", name: "Rose Gold", hex: "#f3d1c9" },
];

export const ANGLES = [
  { id: "Flat", name: "Flat Layout", desc: "Clean and direct" },
  { id: "Left Tilt", name: "Left 3D Tilt", desc: "Modern perspective" },
  { id: "Right Tilt", name: "Right 3D Tilt", desc: "Dynamic isometric view" },
  { id: "Floating", name: "Floating Depth", desc: "Ambient drop height" },
];

interface MockupRecord {
  id: string;
  title: string;
  screenshotUrl: string | null;
  mockupUrl: string | null;
  deviceFrame: string | null;
  background: string | null;
  tilt: string | null;
  createdAt: string | Date;
}

interface MockupBuilderProps {
  plan: "free" | "pro";
  initialUsage: number;
  initialMockups: MockupRecord[];
  userRole?: "admin" | "user";
}

// React Flow Custom Node Renderer Component
function CustomDeviceNode({ id, data, selected }: any) {
  const activeColor = FRAME_COLORS.find((c) => c.id === data.frameColor) || FRAME_COLORS[0];
  
  let outerBezelBorder = "border-[#1e2029]";
  let middleBezelBg = "bg-[#0b0c10]";
  let lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]";
  
  if (data.frameColor === "Light") {
    outerBezelBorder = "border-[#94a3b8]";
    middleBezelBg = "bg-[#e2e8f0]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]";
  } else if (data.frameColor === "Gold") {
    outerBezelBorder = "border-[#b5942b]";
    middleBezelBg = "bg-[#f1e4c3]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]";
  } else if (data.frameColor === "Space Black") {
    outerBezelBorder = "border-[#090a0f]";
    middleBezelBg = "bg-[#18191f]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";
  } else if (data.frameColor === "Rose Gold") {
    outerBezelBorder = "border-[#dfa295]";
    middleBezelBg = "bg-[#f6e5e1]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]";
  }

  const buttonsColor = activeColor.hex;
  let transform3DStyle = "";
  let shadowStyle = "";

  const intensity = data.shadowIntensity || "Soft";

  switch (data.tilt) {
    case "Left Tilt":
      transform3DStyle = "perspective(1200px) rotateY(-20deg) rotateX(8deg) rotateZ(3deg) scale(0.85)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(-16px 20px 25px rgba(0, 0, 0, 0.35))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(-28px 36px 48px rgba(0, 0, 0, 0.6)) drop-shadow(-4px 8px 16px rgba(0, 0, 0, 0.3))";
      }
      break;
    case "Right Tilt":
      transform3DStyle = "perspective(1200px) rotateY(20deg) rotateX(8deg) rotateZ(-3deg) scale(0.85)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(16px 20px 25px rgba(0, 0, 0, 0.35))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(28px 36px 48px rgba(0, 0, 0, 0.6)) drop-shadow(4px 8px 16px rgba(0, 0, 0, 0.3))";
      }
      break;
    case "Floating":
      transform3DStyle = "perspective(1200px) rotateX(12deg) translateY(-12px) scale(0.88)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.35))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(0 40px 60px rgba(0, 0, 0, 0.65)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))";
      }
      break;
    case "Flat":
    default:
      transform3DStyle = "perspective(1200px) scale(0.92)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(0 12px 20px rgba(0, 0, 0, 0.25))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(0 30px 45px rgba(0, 0, 0, 0.55)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))";
      }
      break;
  }

  return (
    <div 
      className={`relative w-full h-full flex flex-col items-center justify-center select-none ${
        selected ? "ring-2 ring-indigo-500 rounded-[38px] scale-102 shadow-[0_0_20px_rgba(99,102,241,0.35)]" : ""
      }`}
      style={{ transform: transform3DStyle }}
    >
      <NodeResizer 
        color="#6366f1"
        minWidth={100}
        minHeight={212}
        keepAspectRatio={true}
        isVisible={selected}
        handleStyle={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#ffffff', border: '2px solid #6366f1' }}
        lineStyle={{ border: '1.5px dashed #6366f1' }}
      />
      {/* Outer Titanium Layer (Double bezel rim) */}
      <div 
        className={`w-full h-full rounded-[38px] border-[8px] bg-[#0c0d12] flex flex-col overflow-hidden relative ${outerBezelBorder} ${middleBezelBg} ${lightChamferClass} ${shadowStyle}`}
      >
        {/* Physical side buttons with metal reflections */}
        <div 
          className="absolute -left-[10px] top-[70px] w-[3px] h-[22px] rounded-l-sm z-30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border-y border-black/30" 
          style={{ backgroundColor: buttonsColor }} 
        />
        <div 
          className="absolute -left-[10px] top-[98px] w-[3px] h-[22px] rounded-l-sm z-30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border-y border-black/30" 
          style={{ backgroundColor: buttonsColor }} 
        />
        <div 
          className="absolute -right-[10px] top-[84px] w-[3px] h-[36px] rounded-r-sm z-30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border-y border-black/30" 
          style={{ backgroundColor: buttonsColor }} 
        />

        {/* Notch dynamic layouts with glass lens reflections */}
        {(data.deviceFrame === "iPhone 17 Pro" || data.deviceFrame === "iPhone 16 Pro" || data.deviceFrame === "iPhone 15 Pro") && (
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[42%] h-[15px] bg-[#090a0f] border border-white/5 rounded-full z-30 flex items-center justify-center">
            {/* Camera Lens Reflection */}
            <span 
              className="w-1.5 h-1.5 rounded-full absolute right-[25%] shadow-inner flex items-center justify-center" 
              style={{
                background: "radial-gradient(circle at 35% 35%, #2563eb 0%, #1e3a8a 50%, #030712 100%)",
                opacity: 0.85
              }}
            >
              <span className="w-0.5 h-0.5 rounded-full bg-white/40 absolute top-0.5 left-0.5" />
            </span>
            {/* Sensor Dot */}
            <span className="w-1 h-1 rounded-full bg-[#1e2030] absolute left-[30%] opacity-40" />
          </div>
        )}

        {(data.deviceFrame === "iPhone 14" || data.deviceFrame === "iPhone 13") && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[52%] h-[18px] bg-[#090a0f] border-x border-b border-white/5 rounded-b-[10px] z-30 flex items-center justify-center">
            <span className="w-[45%] h-[2px] bg-[#222] rounded-full absolute top-[3px]" />
          </div>
        )}

        {data.deviceFrame === "Google Pixel 9 Pro" && (
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[11px] h-[11px] bg-[#090a0f] rounded-full z-30 border border-white/5 flex items-center justify-center">
            <span 
              className="w-1.5 h-1.5 rounded-full shadow-inner flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, #2563eb 0%, #1e3a8a 50%, #030712 100%)",
                opacity: 0.85
              }}
            >
              <span className="w-0.5 h-0.5 rounded-full bg-white/40 absolute top-0.5 left-0.5" />
            </span>
          </div>
        )}

        {data.deviceFrame === "Samsung Galaxy S24" && (
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] bg-[#000] rounded-full z-30 border border-white/5 flex items-center justify-center" />
        )}

        {data.deviceFrame === "Sony Xperia 1 VI" && (
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-[#000] rounded-full z-30 border border-white/5 flex items-center justify-center" />
        )}

        {/* 1px inset ring */}
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none z-20" />

        {/* Inner Glass Bezel & Screen Wrapper */}
        <div className="w-full h-full rounded-[29px] bg-black p-[3.5px] overflow-hidden flex relative">
          <div className="w-full h-full relative rounded-[25px] overflow-hidden bg-[#0c0d12] flex items-center justify-center">
            {data.screenshotUrl ? (
              <img 
                src={data.screenshotUrl} 
                alt="Screenshot Preview" 
                className="w-full h-full object-cover select-none pointer-events-none z-10" 
              />
            ) : (
              <div className="w-full h-full bg-[#0c0d12] flex flex-col items-center justify-center p-4 text-center gap-1.5 z-10">
                <svg className="w-6 h-6 text-text-dim animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 00-1.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-[8px] font-bold text-text-dim uppercase tracking-wider">No Asset Uploaded</span>
                <span className="text-[7px] text-text-dim leading-snug">Drag & drop screen in sidebar</span>
              </div>
            )}

            {/* Premium Dynamic Glass Glare Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-20 opacity-85"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0) 65%)"
              }}
            />
          </div>
        </div>

      </div>

      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete(id);
          }}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-600 border border-rose-500/20 text-white flex items-center justify-center shadow-lg active:scale-90 hover:bg-rose-500 transition-all z-50 cursor-pointer"
          title="Delete screen"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

// High Fidelity Static Device Mockup component for stacked board static previews
function StaticDeviceMockup({ node, shadowIntensity }: { node: any; shadowIntensity: "None" | "Soft" | "Dramatic" }) {
  const data = node.data || {};
  const frameColor = data.frameColor || node.frameColor || "Dark";
  const deviceFrame = data.deviceFrame || node.deviceFrame || "iPhone 17 Pro";
  const tilt = data.tilt || node.tilt || "Flat";
  const screenshotUrl = data.screenshotUrl || node.screenshotUrl;

  const activeColor = FRAME_COLORS.find((c) => c.id === frameColor) || FRAME_COLORS[0];
  
  let outerBezelBorder = "border-[#1e2029]";
  let middleBezelBg = "bg-[#0b0c10]";
  let lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]";
  
  if (frameColor === "Light") {
    outerBezelBorder = "border-[#94a3b8]";
    middleBezelBg = "bg-[#e2e8f0]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]";
  } else if (frameColor === "Gold") {
    outerBezelBorder = "border-[#b5942b]";
    middleBezelBg = "bg-[#f1e4c3]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]";
  } else if (frameColor === "Space Black") {
    outerBezelBorder = "border-[#090a0f]";
    middleBezelBg = "bg-[#18191f]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]";
  } else if (frameColor === "Rose Gold") {
    outerBezelBorder = "border-[#dfa295]";
    middleBezelBg = "bg-[#f6e5e1]";
    lightChamferClass = "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]";
  }

  const buttonsColor = activeColor.hex;
  let transform3DStyle = "";
  let shadowStyle = "";

  const intensity = shadowIntensity || "Soft";

  switch (tilt) {
    case "Left Tilt":
      transform3DStyle = "perspective(1200px) rotateY(-20deg) rotateX(8deg) rotateZ(3deg) scale(0.85)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(-16px 20px 25px rgba(0, 0, 0, 0.35))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(-28px 36px 48px rgba(0, 0, 0, 0.6)) drop-shadow(-4px 8px 16px rgba(0, 0, 0, 0.3))";
      }
      break;
    case "Right Tilt":
      transform3DStyle = "perspective(1200px) rotateY(20deg) rotateX(8deg) rotateZ(-3deg) scale(0.85)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(16px 20px 25px rgba(0, 0, 0, 0.35))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(28px 36px 48px rgba(0, 0, 0, 0.6)) drop-shadow(4px 8px 16px rgba(0, 0, 0, 0.3))";
      }
      break;
    case "Floating":
      transform3DStyle = "perspective(1200px) rotateX(12deg) translateY(-12px) scale(0.88)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.35))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(0 40px 60px rgba(0, 0, 0, 0.65)) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4))";
      }
      break;
    case "Flat":
    default:
      transform3DStyle = "perspective(1200px) scale(0.92)";
      if (intensity === "Soft") {
        shadowStyle = "drop-shadow(0 12px 20px rgba(0, 0, 0, 0.25))";
      } else if (intensity === "Dramatic") {
        shadowStyle = "drop-shadow(0 30px 45px rgba(0, 0, 0, 0.55)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3))";
      }
      break;
  }

  const width = node.width || 172;
  const height = node.height || 364;

  return (
    <div 
      className="relative flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none"
      style={{ 
        transform: transform3DStyle,
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      {/* Outer Titanium Layer (Double bezel rim) */}
      <div 
        className={`w-full h-full rounded-[38px] border-[8px] bg-[#0c0d12] flex flex-col overflow-hidden relative ${outerBezelBorder} ${middleBezelBg} ${lightChamferClass} ${shadowStyle}`}
      >
        {/* Physical side buttons with metal reflections */}
        <div 
          className="absolute -left-[10px] top-[70px] w-[3px] h-[22px] rounded-l-sm z-30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border-y border-black/30" 
          style={{ backgroundColor: buttonsColor }} 
        />
        <div 
          className="absolute -left-[10px] top-[98px] w-[3px] h-[22px] rounded-l-sm z-30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border-y border-black/30" 
          style={{ backgroundColor: buttonsColor }} 
        />
        <div 
          className="absolute -right-[10px] top-[84px] w-[3px] h-[36px] rounded-r-sm z-30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] border-y border-black/30" 
          style={{ backgroundColor: buttonsColor }} 
        />

        {/* Notch dynamic layouts with glass lens reflections */}
        {(deviceFrame === "iPhone 17 Pro" || deviceFrame === "iPhone 16 Pro" || deviceFrame === "iPhone 15 Pro") && (
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[42%] h-[15px] bg-[#090a0f] border border-white/5 rounded-full z-30 flex items-center justify-center">
            {/* Camera Lens Reflection */}
            <span 
              className="w-1.5 h-1.5 rounded-full absolute right-[25%] shadow-inner flex items-center justify-center" 
              style={{
                background: "radial-gradient(circle at 35% 35%, #2563eb 0%, #1e3a8a 50%, #030712 100%)",
                opacity: 0.85
              }}
            >
              <span className="w-0.5 h-0.5 rounded-full bg-white/40 absolute top-0.5 left-0.5" />
            </span>
            {/* Sensor Dot */}
            <span className="w-1 h-1 rounded-full bg-[#1e2030] absolute left-[30%] opacity-40" />
          </div>
        )}

        {(deviceFrame === "iPhone 14" || deviceFrame === "iPhone 13") && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[52%] h-[18px] bg-[#090a0f] border-x border-b border-white/5 rounded-b-[10px] z-30 flex items-center justify-center">
            <span className="w-[45%] h-[2px] bg-[#222] rounded-full absolute top-[3px]" />
          </div>
        )}

        {deviceFrame === "Google Pixel 9 Pro" && (
          <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[11px] h-[11px] bg-[#090a0f] rounded-full z-30 border border-white/5 flex items-center justify-center">
            <span 
              className="w-1.5 h-1.5 rounded-full shadow-inner flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, #2563eb 0%, #1e3a8a 50%, #030712 100%)",
                opacity: 0.85
              }}
            >
              <span className="w-0.5 h-0.5 rounded-full bg-white/40 absolute top-0.5 left-0.5" />
            </span>
          </div>
        )}

        {deviceFrame === "Samsung Galaxy S24" && (
          <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] bg-[#000] rounded-full z-30 border border-white/5 flex items-center justify-center" />
        )}

        {deviceFrame === "Sony Xperia 1 VI" && (
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] bg-[#000] rounded-full z-30 border border-white/5 flex items-center justify-center" />
        )}

        {/* 1px inset ring */}
        <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none z-20" />

        {/* Inner Glass Bezel & Screen Wrapper */}
        <div className="w-full h-full rounded-[29px] bg-black p-[3.5px] overflow-hidden flex relative">
          <div className="w-full h-full relative rounded-[25px] overflow-hidden bg-[#0c0d12] flex items-center justify-center">
            {screenshotUrl ? (
              <img 
                src={screenshotUrl} 
                alt="Screenshot Preview" 
                className="w-full h-full object-cover select-none pointer-events-none z-10" 
              />
            ) : (
              <div className="w-full h-full bg-[#0c0d12] flex flex-col items-center justify-center p-4 text-center gap-1.5 z-10">
                <svg className="w-6 h-6 text-text-dim animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 00-1.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-[8px] font-bold text-text-dim uppercase tracking-wider">No Asset</span>
              </div>
            )}

            {/* Premium Dynamic Glass Glare Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-20 opacity-85"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0) 65%)"
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

const nodeTypes = {
  deviceMockup: CustomDeviceNode,
};

export function MockupBuilder({ plan, initialUsage, initialMockups, userRole = "user" }: MockupBuilderProps) {
  // SSR Hydration safeguard
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Builder Settings
  const [title, setTitle] = useState("My App Shot");
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_PRESETS[0].id);
  const [customBgColor, setCustomBgColor] = useState("");
  const [shadowIntensity, setShadowIntensity] = useState<"None" | "Soft" | "Dramatic">("Soft");
  const [paddingLevel, setPaddingLevel] = useState<"Compact" | "Standard" | "Spacious">("Standard");
  
  // Text Overlay State
  const [textOverlay, setTextOverlay] = useState("");
  const [textPosition, setTextPosition] = useState<"Top" | "Bottom">("Top");
  const [textFontSize, setTextFontSize] = useState<number>(32);
  const [textColor, setTextColor] = useState<string>("");
  const [textWeight, setTextWeight] = useState<"normal" | "medium" | "bold" | "extrabold">("bold");

  // Alignment Grid State
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [gridVariant, setGridVariant] = useState<"dots" | "lines" | "cross">("dots");

  // React Flow Nodes
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  interface Board {
    id: string;
    title: string;
    selectedBg: string;
    customBgColor: string;
    shadowIntensity: "None" | "Soft" | "Dramatic";
    paddingLevel: "Compact" | "Standard" | "Spacious";
    textOverlay: string;
    textPosition: "Top" | "Bottom";
    textFontSize: number;
    textColor: string;
    textWeight: "normal" | "medium" | "bold" | "extrabold";
    gridVisible: boolean;
    gridVariant: "dots" | "lines" | "cross";
    nodes: Node[];
  }

  // Multi-Board stacking presentation slides state
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string>("");
  const prevActiveBoardIdRef = useRef<string>("");

  const hydrateLocalStates = (board: Board) => {
    setTitle(board.title);
    setSelectedBg(board.selectedBg);
    setCustomBgColor(board.customBgColor || "");
    setShadowIntensity(board.shadowIntensity || "Soft");
    setPaddingLevel(board.paddingLevel || "Standard");
    setTextOverlay(board.textOverlay || "");
    setTextPosition(board.textPosition || "Top");
    setTextFontSize(board.textFontSize || 32);
    setTextColor(board.textColor || "");
    setTextWeight(board.textWeight || "bold");
    setGridVisible(board.gridVisible !== undefined ? board.gridVisible : true);
    setGridVariant(board.gridVariant || "dots");
    setNodes(board.nodes || []);
  };

  // Load saved workspace state from localStorage on mount
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem("mockly_workspace_state");
      if (saved) {
        const state = JSON.parse(saved);
        if (state.boards && Array.isArray(state.boards) && state.boards.length > 0) {
          setBoards(state.boards);
          setActiveBoardId(state.activeBoardId || state.boards[0].id);
          const active = state.boards.find((b: any) => b.id === (state.activeBoardId || state.boards[0].id)) || state.boards[0];
          hydrateLocalStates(active);
        } else {
          // Legacy format fallback
          const legacyBoard: Board = {
            id: `board-${Date.now()}`,
            title: state.title ?? "My App Shot",
            selectedBg: state.selectedBg ?? BACKGROUND_PRESETS[0].id,
            customBgColor: state.customBgColor ?? "",
            shadowIntensity: state.shadowIntensity ?? "Soft",
            paddingLevel: state.paddingLevel ?? "Standard",
            textOverlay: state.textOverlay ?? "",
            textPosition: state.textPosition ?? "Top",
            textFontSize: state.textFontSize ?? 32,
            textColor: state.textColor ?? "",
            textWeight: state.textWeight ?? "bold",
            gridVisible: state.gridVisible !== undefined ? state.gridVisible : true,
            gridVariant: state.gridVariant ?? "dots",
            nodes: state.nodes || [],
          };
          setBoards([legacyBoard]);
          setActiveBoardId(legacyBoard.id);
          hydrateLocalStates(legacyBoard);
        }
      } else {
        // Brand new state
        const newBoard: Board = {
          id: `board-${Date.now()}`,
          title: "My App Shot",
          selectedBg: BACKGROUND_PRESETS[0].id,
          customBgColor: "",
          shadowIntensity: "Soft",
          paddingLevel: "Standard",
          textOverlay: "",
          textPosition: "Top",
          textFontSize: 32,
          textColor: "",
          textWeight: "bold",
          gridVisible: true,
          gridVariant: "dots",
          nodes: [],
        };
        setBoards([newBoard]);
        setActiveBoardId(newBoard.id);
        hydrateLocalStates(newBoard);
      }
    } catch (e) {
      console.error("Failed to load saved workspace state:", e);
    }
  }, [mounted]);

  // Sync active local settings back into the active board object in boards array
  useEffect(() => {
    // If we just switched the active board, do NOT sync local states back to the new board.
    // Instead, wait for the state hydration to complete to avoid race conditions.
    if (prevActiveBoardIdRef.current !== activeBoardId) {
      prevActiveBoardIdRef.current = activeBoardId;
      return;
    }

    if (!mounted || !activeBoardId || boards.length === 0) return;
    setBoards((prev) =>
      prev.map((b) => {
        if (b.id === activeBoardId) {
          return {
            ...b,
            title,
            selectedBg,
            customBgColor,
            shadowIntensity,
            paddingLevel,
            textOverlay,
            textPosition,
            textFontSize,
            textColor,
            textWeight,
            gridVisible,
            gridVariant,
            nodes,
          };
        }
        return b;
      })
    );
  }, [
    mounted,
    activeBoardId,
    title,
    selectedBg,
    customBgColor,
    shadowIntensity,
    paddingLevel,
    textOverlay,
    textPosition,
    textFontSize,
    textColor,
    textWeight,
    gridVisible,
    gridVariant,
    nodes,
  ]);

  // Persist entire multi-board structure to localStorage
  useEffect(() => {
    if (!mounted || boards.length === 0) return;
    try {
      const state = {
        boards,
        activeBoardId,
      };
      localStorage.setItem("mockly_workspace_state", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save workspace state to localStorage:", e);
    }
  }, [mounted, boards, activeBoardId]);

  const isLightColor = (hex: string) => {
    if (!hex) return false;
    const cleaned = hex.replace("#", "");
    if (cleaned.length === 3) {
      const r = parseInt(cleaned[0] + cleaned[0], 16);
      const g = parseInt(cleaned[1] + cleaned[1], 16);
      const b = parseInt(cleaned[2] + cleaned[2], 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
    }
    if (cleaned.length === 6) {
      const r = parseInt(cleaned.substring(0, 2), 16);
      const g = parseInt(cleaned.substring(2, 4), 16);
      const b = parseInt(cleaned.substring(4, 6), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) > 186;
    }
    return false;
  };

  const isBgLight = selectedBg === "white" || selectedBg === "candy" || isLightColor(customBgColor);

  // Controls open states for Collapsible sidebar groups
  const [openSections, setOpenSections] = useState({
    uploads: true,
    inspector: true,
    backdrop: false,
    composition: false,
    text: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Toast Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 4000);
  };

  // Helper to trigger direct browser file download for cross-origin URLs
  const handleDirectDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 150);
    } catch (err) {
      console.error("Direct download failed, falling back to open in tab:", err);
      // Fallback: Open in new tab
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // 1. Add Board Page
  const handleAddBoard = () => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: newBoardId,
      title: `Board Page ${boards.length + 1}`,
      selectedBg: BACKGROUND_PRESETS[0].id,
      customBgColor: "",
      shadowIntensity: "Soft",
      paddingLevel: "Standard",
      textOverlay: "",
      textPosition: "Top",
      textFontSize: 32,
      textColor: "",
      textWeight: "bold",
      gridVisible: true,
      gridVariant: "dots",
      nodes: [],
    };
    setBoards([...boards, newBoard]);
    setActiveBoardId(newBoardId);
    hydrateLocalStates(newBoard);
    showToast("Added new slide board!", "success");
  };

  // 2. Duplicate Board Page
  const handleDuplicateBoard = (boardToDuplicate: Board) => {
    const newBoardId = `board-${Date.now()}`;
    // Clone nodes with unique React Flow IDs to prevent duplication conflicts
    const clonedNodes = boardToDuplicate.nodes.map((n, i) => ({
      ...n,
      id: `node-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
      selected: false,
    }));

    const duplicatedBoard: Board = {
      ...boardToDuplicate,
      id: newBoardId,
      title: `${boardToDuplicate.title} (Copy)`,
      nodes: clonedNodes,
    };

    // Insert duplicated board right after the duplicated slide
    const index = boards.findIndex((b) => b.id === boardToDuplicate.id);
    const updatedBoards = [...boards];
    updatedBoards.splice(index + 1, 0, duplicatedBoard);

    setBoards(updatedBoards);
    setActiveBoardId(newBoardId);
    hydrateLocalStates(duplicatedBoard);
    showToast("Duplicated slide board successfully!", "success");
  };

  // 3. Delete Board Page
  const handleDeleteBoard = (id: string) => {
    if (boards.length <= 1) {
      showToast("Cannot delete: You must have at least one board.", "error");
      return;
    }

    const updatedBoards = boards.filter((b) => b.id !== id);
    setBoards(updatedBoards);

    // If the active board was deleted, switch active pointer to another one
    if (activeBoardId === id) {
      const remainingBoard = updatedBoards[0];
      setActiveBoardId(remainingBoard.id);
      hydrateLocalStates(remainingBoard);
    }
    showToast("Slide board removed from workspace.", "success");
  };

  // 4. Move Board Up
  const handleMoveBoardUp = (index: number) => {
    if (index === 0) return;
    const updated = [...boards];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setBoards(updated);
  };

  // 5. Move Board Down
  const handleMoveBoardDown = (index: number) => {
    if (index === boards.length - 1) return;
    const updated = [...boards];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setBoards(updated);
  };

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Export & Quota States
  const [isExporting, setIsExporting] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [usageCount, setUsageCount] = useState(initialUsage);
  const [mockupsList, setMockupsList] = useState<MockupRecord[]>(initialMockups);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const maxScreens = plan === "free" ? 3 : 7;

  // Dynamic Bounding Box calculation for rendering exact cropped preview inside the modal
  const previewData = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      const x = node.position.x ?? 0;
      const y = node.position.y ?? 0;
      const w = node.width ?? 172;
      const h = node.height ?? 364;

      if (x < minX) minX = x;
      if (x + w > maxX) maxX = x + w;
      if (y < minY) minY = y;
      if (y + h > maxY) maxY = y + h;
    }

    if (minX === Infinity) minX = 0;
    if (maxX === -Infinity) maxX = 1200;
    if (minY === Infinity) minY = 0;
    if (maxY === -Infinity) maxY = 675;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    let paddingValue = 48; // Default Standard
    if (paddingLevel === "Compact") paddingValue = 24;
    else if (paddingLevel === "Spacious") paddingValue = 80;

    let textSpace = 0;
    if (textOverlay) {
      textSpace = (textFontSize || 32) * 1.5 + 24;
    }

    const paddingTop = paddingValue + (textOverlay && textPosition === "Top" ? textSpace : 0);
    const paddingBottom = paddingValue + (textOverlay && textPosition === "Bottom" ? textSpace : 0);
    const paddingLeft = paddingValue;
    const paddingRight = paddingValue;

    const exportWidth = Math.round(contentWidth + paddingLeft + paddingRight);
    const exportHeight = Math.round(contentHeight + paddingTop + paddingBottom);

    return {
      minX,
      minY,
      paddingTop,
      paddingLeft,
      paddingRight,
      paddingBottom,
      exportWidth,
      exportHeight,
    };
  }, [nodes, paddingLevel, textOverlay, textPosition, textFontSize]);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [zoomMode, setZoomMode] = useState<"fit" | "custom">("fit");
  const [customZoom, setCustomZoom] = useState<number>(100);
  const [fitScale, setFitScale] = useState<number>(1);

  useEffect(() => {
    if (!showPreviewModal) return;
    const updateScale = () => {
      if (!previewContainerRef.current) return;
      
      const containerWidth = previewContainerRef.current.clientWidth - 48; // padding
      const containerHeight = previewContainerRef.current.clientHeight - 80; // height padding for toolbar & spacing
      
      if (containerWidth <= 0 || containerHeight <= 0) return;

      const wScale = containerWidth / previewData.exportWidth;
      const hScale = containerHeight / previewData.exportHeight;
      
      const scale = Math.min(wScale, hScale);
      setFitScale(scale > 0 ? scale : 1);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && previewContainerRef.current) {
      observer = new ResizeObserver(() => {
        updateScale();
      });
      observer.observe(previewContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateScale);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [showPreviewModal, previewData.exportWidth, previewData.exportHeight]);

  const currentScale = zoomMode === "fit" ? fitScale : customZoom / 100;


  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create checkout session.");
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An unexpected error occurred during checkout.", "error");
      setIsUpgrading(false);
    }
  };

  // Find active node in React Flow (selected === true)
  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);

  // Dynamically compute node depths (active node on top)
  // Stable delete callback to prevent stale closures
  const handleDeleteNode = React.useCallback((id: string) => {
    deleteNode(id);
  }, []);

  const nodesWithZIndex = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      zIndex: node.selected ? 10 : 1,
      data: {
        ...node.data,
        shadowIntensity,
        onDelete: handleDeleteNode,
      }
    }));
  }, [nodes, shadowIntensity, handleDeleteNode]);

  const activeBg = BACKGROUND_PRESETS.find((bg) => bg.id === selectedBg) || BACKGROUND_PRESETS[0];

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processImageUploads(files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processImageUploads(files);
    }
  };

  // Add screenshot(s) to the layout sandbox with automatic side-by-side arrangement
  const processImageUploads = async (filesList: FileList | File[]) => {
    const filesArray = Array.from(filesList).filter((file) => {
      if (!file.type.startsWith("image/")) {
        showToast(`Skipped "${file.name}": Please upload a valid image file (PNG, JPG, WebP).`, "error");
        return false;
      }
      if (file.size > 8 * 1024 * 1024) {
        showToast(`Skipped "${file.name}": File size exceeds 8MB limit.`, "error");
        return false;
      }
      return true;
    });

    if (filesArray.length === 0) return;

    const currentCount = nodes.length;
    const availableSlots = maxScreens - currentCount;

    if (availableSlots <= 0) {
      showToast(`Limit reached: You can upload up to ${maxScreens} screens on your ${plan} plan.`, "error");
      if (plan === "free") setShowLimitModal(true);
      return;
    }

    const filesToUpload = filesArray.slice(0, availableSlots);
    const skippedCount = filesArray.length - filesToUpload.length;

    if (skippedCount > 0) {
      showToast(`Adding ${filesToUpload.length} screens. Skipped ${skippedCount} screen(s) due to ${plan} plan limits.`, "error");
      if (plan === "free") {
        setTimeout(() => setShowLimitModal(true), 1200);
      }
    }

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file, i) => {
        // Base64 read inside a promise
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (e) => reject(e);
        });

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: base64Data,
            fileName: file.name,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to upload "${file.name}".`);

        // Arrange new custom device mockup nodes side-by-side with 220px offset
        const nodeIndex = currentCount + i;
        const xPos = 200 + (nodeIndex * 220) % (1200 - 172 - 100); 
        const yPos = 120 + Math.floor((nodeIndex * 220) / (1200 - 172 - 100)) * 60;

        const spawnedNode: Node = {
          id: `node-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          type: "deviceMockup",
          position: {
            x: xPos,
            y: yPos,
          },
          width: 172,
          height: 364,
          data: {
            screenshotUrl: data.url,
            deviceFrame: DEVICE_FRAMES[0].id,
            frameColor: FRAME_COLORS[0].id,
            tilt: ANGLES[0].id,
          },
          selected: i === filesToUpload.length - 1, // Select the last spawned node
        };
        return spawnedNode;
      });

      const spawnedNodes = await Promise.all(uploadPromises);

      // Add to state and set selected states correctly
      setNodes((nds) => {
        const updatedExisting = nds.map((n) => ({ ...n, selected: false }));
        return [...updatedExisting, ...spawnedNodes] as Node[];
      });

      showToast(`Added ${filesToUpload.length} screen(s) to workspace!`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "An unexpected error occurred during upload.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    showToast("Screen removed from workspace.", "success");
  };

  // Settings modification updates data properties of the highlighted node
  const updateSelectedNode = (field: "deviceFrame" | "frameColor" | "tilt", value: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              [field]: value,
            },
          };
        }
        return node;
      })
    );
  };

  // Interactive sandbox dynamic scale scaling hook
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setScale(width / 1200);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  // Export PNG compiles complete coordinate array
  const handleExport = async (boardToExport?: Board) => {
    const targetBoard = boardToExport || {
      title,
      selectedBg,
      customBgColor,
      shadowIntensity,
      paddingLevel,
      textOverlay,
      textPosition,
      textFontSize,
      textColor,
      textWeight,
      nodes,
    };

    if (targetBoard.nodes.length === 0) {
      showToast(`Please upload at least one screenshot to "${targetBoard.title}" first!`, "error");
      return;
    }

    if (plan === "free" && userRole !== "admin" && usageCount >= 5) {
      setShowLimitModal(true);
      return;
    }

    setIsExporting(true);

    try {
      // Map React Flow nodes list to simplified absolute payload coordinate structures
      const nodesPayload = targetBoard.nodes.map((n) => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        width: n.width || 172,
        height: n.height || 364,
        screenshotUrl: (n as any).screenshotUrl || n.data?.screenshotUrl,
        deviceFrame: (n as any).deviceFrame || n.data?.deviceFrame,
        frameColor: (n as any).frameColor || n.data?.frameColor,
        tilt: (n as any).tilt || n.data?.tilt,
        selected: n.selected || false,
      }));

      console.log("[Export Debug] Payload nodes count:", nodesPayload.length);
      console.log("[Export Debug] First node sample:", JSON.stringify(nodesPayload[0], null, 2));

      const requestBody = {
        title: targetBoard.title.trim() || "My App Mockup",
        background: targetBoard.selectedBg,
        customBgColor: targetBoard.customBgColor || null,
        shadowIntensity: targetBoard.shadowIntensity,
        paddingLevel: targetBoard.paddingLevel,
        textOverlay: targetBoard.textOverlay ? targetBoard.textOverlay.trim() : null,
        textPosition: targetBoard.textPosition,
        textFontSize: targetBoard.textFontSize,
        textColor: targetBoard.textColor || null,
        textWeight: targetBoard.textWeight,
        nodes: nodesPayload,
        // Legacy backward compatibility placeholders
        screenshotUrl: nodesPayload[0]?.screenshotUrl || null,
        deviceFrame: nodesPayload[0]?.deviceFrame || null,
        tilt: nodesPayload[0]?.tilt || null,
      };

      console.log("[Export Debug] background:", requestBody.background);
      console.log("[Export Debug] screenshotUrl present:", !!requestBody.screenshotUrl);

      const res = await fetch("/api/mockups/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log("[Export Debug] Response status:", res.status, "data:", data);
      if (!res.ok) throw new Error(data.error || "Export failed.");

      setMockupsList([data.mockup, ...mockupsList]);
      setUsageCount((prev) => prev + 1);
      showToast(`Exported "${targetBoard.title}" successfully!`, "success");

      await handleDirectDownload(
        data.mockup.mockupUrl,
        `${targetBoard.title.replace(/\s+/g, "-").toLowerCase()}-mockup.png`
      );

    } catch (err: any) {
      console.error("[Export Debug] Export error:", err);
      console.error("[Export Debug] Error message:", err.message);
      showToast(err.message || "Failed to generate mockup.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const [isBulkExporting, setIsBulkExporting] = useState(false);

  const handleBulkExport = async () => {
    const validBoards = boards.filter((b) => b.nodes.length > 0);
    if (validBoards.length === 0) {
      showToast("None of your boards contain screenshots. Please add assets before exporting!", "error");
      return;
    }

    if (plan === "free" && userRole !== "admin" && usageCount + validBoards.length > 5) {
      setShowLimitModal(true);
      return;
    }

    setIsBulkExporting(true);
    showToast(`Bulk exporting ${validBoards.length} slides... Please wait!`, "success");

    try {
      // Export all boards concurrently
      const exportPromises = validBoards.map((b) => handleExport(b));
      await Promise.all(exportPromises);
      showToast("All mockups compiled and downloaded successfully!", "success");
    } catch (err: any) {
      console.error("Bulk export encountered errors:", err);
    } finally {
      setIsBulkExporting(false);
    }
  };

  const handleDeleteMockup = async (mockupId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this generated mockup?")) return;

    try {
      const res = await fetch(`/api/mockups/delete?id=${mockupId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");

      setMockupsList((prev) => prev.filter((m) => m.id !== mockupId));
      showToast("Mockup deleted successfully!", "success");
    } catch (err: any) {
      console.error("Delete mockup error:", err);
      showToast(err.message || "Failed to delete mockup.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left relative">
      
      {/* Sliding elegant Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border border-border-strong animate-slide-in ${
          toast.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="hover:opacity-80 ml-2 cursor-pointer">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upgrade Block Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-medium rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h3 className="text-xl font-extrabold text-foreground-pure mb-2">Upgrade to Pro</h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Export unlimited high-res multi-device renders, position up to **7 devices on canvas**, and style with premium custom presets!
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold py-3 rounded-full text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all select-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpgrading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Unlock Unlimited for $9/mo"
                )}
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full bg-foreground/[0.03] border border-border-medium hover:bg-foreground/[0.06] text-foreground-pure font-bold py-3 rounded-full text-sm active:scale-95 transition-all select-none cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek High-Fidelity Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-[#06080d]/85 backdrop-blur-xl z-[150] flex flex-col items-center justify-center p-4 md:p-6">
          <div className="bg-[#090b11]/95 border border-border-medium rounded-[32px] max-w-5xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative backdrop-blur-md animate-scale-in">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            
            {/* Header */}
            <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-foreground/[0.01]">
              <div className="flex flex-col text-left gap-1">
                <h3 className="text-sm font-black tracking-widest text-foreground-pure uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  WYSIWYG Live Mockup Preview
                </h3>
                <p className="text-[10px] text-text-muted">
                  Cropped aspect ratio preview of "{title.trim() || "My App Mockup"}" before exporting.
                </p>
              </div>
              
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full bg-foreground/[0.03] border border-border-medium text-text-dim hover:text-foreground-pure flex items-center justify-center hover:bg-foreground/[0.08] transition-all cursor-pointer"
                title="Close preview"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Viewport Canvas */}
            <div 
              ref={previewContainerRef}
              className={`flex-1 p-8 bg-[#030407]/45 flex items-center justify-center min-h-[350px] max-h-[60vh] relative ${
                zoomMode === "fit" ? "overflow-hidden" : "overflow-auto"
              }`}
            >
              {/* Floating Glassmorphic Zoom Control Pill */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-[#0c0f17]/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-xl select-none">
                {/* Auto-Fit Mode Toggle */}
                <button
                  type="button"
                  onClick={() => setZoomMode("fit")}
                  className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    zoomMode === "fit"
                      ? "bg-indigo-500 text-white border-indigo-400"
                      : "bg-white/5 border-white/5 text-text-muted hover:text-foreground-pure hover:bg-white/10"
                  }`}
                >
                  Fit ({Math.round(fitScale * 100)}%)
                </button>
                
                {/* Separator */}
                <span className="w-px h-3.5 bg-white/15" />

                {/* Zoom Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    setZoomMode("custom");
                    setCustomZoom(prev => Math.max(10, prev - 10));
                  }}
                  className="w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 flex items-center justify-center text-text-muted hover:text-foreground-pure transition-all active:scale-90 cursor-pointer"
                  title="Zoom Out"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </button>

                {/* Slider */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={zoomMode === "fit" ? Math.round(fitScale * 100) : customZoom}
                    onChange={(e) => {
                      setZoomMode("custom");
                      setCustomZoom(parseInt(e.target.value));
                    }}
                    className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    style={{
                      WebkitAppearance: 'none'
                    }}
                  />
                  <span className="text-[9px] font-black text-foreground-pure font-mono min-w-[28px] text-right">
                    {zoomMode === "fit" ? Math.round(fitScale * 100) : customZoom}%
                  </span>
                </div>

                {/* Zoom In Button */}
                <button
                  type="button"
                  onClick={() => {
                    setZoomMode("custom");
                    setCustomZoom(prev => Math.min(200, prev + 10));
                  }}
                  className="w-6 h-6 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 flex items-center justify-center text-text-muted hover:text-foreground-pure transition-all active:scale-90 cursor-pointer"
                  title="Zoom In"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* Exact scale wrapper layout for scrolling support and visual layout footprint */}
              <div 
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: `${previewData.exportWidth * currentScale}px`,
                  height: `${previewData.exportHeight * currentScale}px`,
                  transition: "width 0.15s ease, height 0.15s ease",
                }}
              >
                <div 
                  className="relative shadow-2xl border border-white/5 overflow-hidden flex origin-top-left flex-shrink-0"
                  style={{
                    width: `${previewData.exportWidth}px`,
                    height: `${previewData.exportHeight}px`,
                    transform: `scale(${currentScale})`,
                    transformOrigin: "top left",
                    background: customBgColor || (BACKGROUND_PRESETS.find((b) => b.id === selectedBg)?.style || BACKGROUND_PRESETS[0].style),
                  }}
                >
                  {/* Presentational grid layer overlay */}
                  {gridVisible && (
                    <div
                      className="absolute inset-0 flex flex-wrap opacity-[0.06] pointer-events-none"
                    >
                      {Array.from({ length: Math.ceil((previewData.exportWidth * previewData.exportHeight) / 6400) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[80px] h-[80px] border-r border-b border-white"
                        />
                      ))}
                    </div>
                  )}

                  {/* Typography Headline Overlay */}
                  {textOverlay && (
                    <div
                      className="absolute left-0 right-0 flex justify-center items-center z-40"
                      style={{
                        top: textPosition === "Top" ? `24px` : "auto",
                        bottom: textPosition === "Bottom" ? `24px` : "auto",
                      }}
                    >
                      <span
                        className="tracking-tight leading-none text-center select-none font-sans"
                        style={{
                          fontSize: `${textFontSize}px`,
                          fontWeight: textWeight === "normal" ? 400 : textWeight === "medium" ? 500 : textWeight === "bold" ? 700 : 800,
                          color: textColor || (selectedBg === "white" || selectedBg === "candy" ? "#000000" : "#ffffff"),
                          textShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        {textOverlay}
                      </span>
                    </div>
                  )}

                  {/* Mockup nodes */}
                  {nodes.map((node) => {
                    const shiftedX = (node.position.x ?? 0) - previewData.minX + previewData.paddingLeft;
                    const shiftedY = (node.position.y ?? 0) - previewData.minY + previewData.paddingTop;

                    return (
                      <div
                        key={node.id}
                        className="absolute"
                        style={{
                          left: `${shiftedX}px`,
                          top: `${shiftedY}px`,
                          width: `${node.width || 172}px`,
                          height: `${node.height || 364}px`,
                        }}
                      >
                        <StaticDeviceMockup node={node} shadowIntensity={shadowIntensity} />
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>

            {/* Footer Bar */}
            <div className="p-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 bg-foreground/[0.01]">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[10px] text-text-dim font-bold uppercase tracking-wider">
                  Dimensions: {previewData.exportWidth}px × {previewData.exportHeight}px (3x density scaling on export)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2.5 rounded-full border border-border-medium hover:bg-foreground/[0.04] text-xs font-black text-foreground-pure transition-all select-none cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => {
                    if (plan === "free" && userRole !== "admin" && usageCount >= 5) {
                      setShowLimitModal(true);
                    } else {
                      setShowPreviewModal(false);
                      handleExport();
                    }
                  }}
                  className={`px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition-all select-none cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                    plan === "free" && userRole !== "admin" && usageCount >= 5
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/20 hover:bg-rose-500/30"
                      : "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-indigo-500/10 hover:shadow-indigo-500/20"
                  }`}
                >
                  {plan === "free" && userRole !== "admin" && usageCount >= 5 ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Upgrade to Export
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export Design Now
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL — Collapsible Settings Accordion Sidebar (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">
          
          {/* Filename Card */}
          <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-5 relative overflow-hidden flex flex-col gap-3">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-foreground-pure">Mockup Project Filename</label>
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-saved</span>
              </div>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Landing Showcase Layout"
              className="w-full bg-foreground/[0.02] border border-border-medium text-foreground-pure rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="border border-border-medium bg-bg-card/50 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden flex flex-col gap-5">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            
            <h3 className="text-sm font-extrabold text-foreground-pure mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Canvas Settings
            </h3>

            {/* Accordion 1: Uploads Hub */}
            <div className="border-b border-border-subtle pb-4">
              <button 
                onClick={() => toggleSection("uploads")}
                className="w-full flex items-center justify-between text-xs font-extrabold text-foreground-pure pb-2 cursor-pointer select-none"
              >
                <span>1. Upload Screens ({nodes.length} / {maxScreens})</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openSections.uploads ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.uploads && (
                <div className="flex flex-col gap-3 mt-3 animate-fade-in">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 min-h-[110px] ${
                      isDragging 
                        ? "border-indigo-500 bg-indigo-500/5" 
                        : "border-border-medium hover:border-border-strong hover:bg-foreground/[0.01]"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-text-muted">Uploading to secure CDN...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 rounded-lg bg-foreground/[0.03] border border-border-medium flex items-center justify-center text-text-muted">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-foreground-pure">Add Draggable Mockup</span>
                        <span className="text-[9px] text-text-dim">Drag image or browse (Max 8MB)</span>
                      </div>
                    )}
                  </div>

                  {/* Active node lists list in accordion */}
                  {nodes.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[10px] font-bold text-text-muted">Screens on Canvas:</span>
                      <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                        {nodes.map((node, i) => (
                          <div 
                            key={node.id} 
                            onClick={() => {
                              // Highlight node
                              setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
                              setOpenSections((prev) => ({ ...prev, inspector: true }));
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                              node.selected 
                                ? "bg-indigo-500/10 border-indigo-500/30 text-foreground-pure" 
                                : "bg-foreground/[0.01] border-border-medium hover:bg-foreground/[0.02]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded bg-black/20 flex items-center justify-center overflow-hidden border border-border-medium">
                                <img src={node.data.screenshotUrl as string} className="object-cover h-full w-full" />
                              </span>
                              <span className="font-semibold text-[10px] truncate max-w-[130px]">
                                Screen {i + 1} ({String(node.data.deviceFrame || "")})
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNode(node.id);
                              }}
                              className="text-text-dim hover:text-rose-400 p-1 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: Device Node Inspector */}
            <div className="border-b border-border-subtle pb-4">
              <button 
                onClick={() => toggleSection("inspector")}
                className="w-full flex items-center justify-between text-xs font-extrabold text-foreground-pure pb-2 cursor-pointer select-none"
              >
                <span>2. Device Inspector</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openSections.inspector ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.inspector && (
                <div className="mt-3 animate-fade-in">
                  {selectedNode ? (
                    <div className="flex flex-col gap-4">
                      {/* Active device frame */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-muted">Device Frame Model</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {DEVICE_FRAMES.map((d) => (
                            <button
                              key={d.id}
                              onClick={() => updateSelectedNode("deviceFrame", d.id)}
                              className={`py-2 px-2.5 rounded-xl border text-[10px] active:scale-[0.98] transition-all select-none cursor-pointer ${
                                selectedNode.data.deviceFrame === d.id
                                  ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure font-bold"
                                  : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                              }`}
                            >
                              {d.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active bezel color */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-muted">Bezel Finish Accent</label>
                        <div className="flex flex-wrap gap-1.5">
                          {FRAME_COLORS.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => updateSelectedNode("frameColor", c.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] active:scale-[0.98] transition-all select-none cursor-pointer ${
                                selectedNode.data.frameColor === c.id
                                  ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure font-bold"
                                  : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: c.hex }} />
                              {c.name.split(" ").slice(-1)[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active presentation angle */}
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-muted">Node presentation angle</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ANGLES.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => updateSelectedNode("tilt", a.id)}
                              className={`p-2 rounded-xl border text-left active:scale-[0.98] transition-all flex flex-col gap-0.5 select-none cursor-pointer ${
                                selectedNode.data.tilt === a.id
                                  ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure"
                                  : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                              }`}
                            >
                              <span className={`font-bold text-[10px] ${selectedNode.data.tilt === a.id ? "text-indigo-400" : "text-foreground-pure"}`}>{a.name}</span>
                              <span className="text-[8px] text-text-dim leading-none">{a.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Delete button in inspector */}
                      <button
                        onClick={() => deleteNode(selectedNode.id)}
                        className="w-full bg-rose-600/10 hover:bg-rose-600/15 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-[10px] font-extrabold py-2.5 rounded-xl cursor-pointer transition-colors"
                      >
                        Delete Screen Node
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 text-center border border-dashed border-border-medium rounded-2xl bg-foreground/[0.01]">
                      <span className="text-[10px] text-text-dim font-medium leading-relaxed block px-4">
                        💡 Select a device mockup on the right canvas to inspect and configure its individual parameters!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 3: Backdrop Canvas */}
            <div className="border-b border-border-subtle pb-4">
              <button 
                onClick={() => toggleSection("backdrop")}
                className="w-full flex items-center justify-between text-xs font-extrabold text-foreground-pure pb-2 cursor-pointer select-none"
              >
                <span>3. Canvas Backdrop</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openSections.backdrop ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.backdrop && (
                <div className="flex flex-col gap-3 mt-3 animate-fade-in">
                  
                  {/* Swatches preset grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {BACKGROUND_PRESETS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setSelectedBg(bg.id);
                          setCustomBgColor(""); // reset custom hex
                        }}
                        title={bg.name}
                        className={`aspect-square rounded-lg transition-all relative active:scale-90 flex items-center justify-center select-none cursor-pointer ${
                          selectedBg === bg.id && !customBgColor
                            ? "scale-105 ring-2 ring-indigo-500 ring-offset-2 ring-offset-background"
                            : "hover:scale-[1.02]"
                        }`}
                        style={{ background: bg.style }}
                      >
                        {selectedBg === bg.id && !customBgColor && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md">
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="flex flex-col gap-1.5 text-left border-t border-border-subtle pt-3">
                    <label className="text-[10px] font-bold text-text-muted">Custom Hex Background Color</label>
                    <div className="flex gap-2">
                      <div 
                        className="w-9 h-9 rounded-xl border border-border-strong flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: customBgColor || "#ffffff" }}
                      />
                      <input
                        type="text"
                        value={customBgColor}
                        onChange={(e) => {
                          setCustomBgColor(e.target.value);
                          setSelectedBg(""); // reset preset selection
                        }}
                        placeholder="e.g. #3b82f6"
                        className="flex-1 bg-foreground/[0.02] border border-border-medium text-foreground-pure rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Accordion 4: Composition Controls */}
            <div className="border-b border-border-subtle pb-4">
              <button 
                onClick={() => toggleSection("composition")}
                className="w-full flex items-center justify-between text-xs font-extrabold text-foreground-pure pb-2 cursor-pointer select-none"
              >
                <span>4. Composition & Margins</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openSections.composition ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.composition && (
                <div className="flex flex-col gap-4 mt-3 animate-fade-in">
                  
                  {/* Shadow levels */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-text-muted">Global Drop Shadow Intensity</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["None", "Soft", "Dramatic"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setShadowIntensity(level)}
                          className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold active:scale-[0.98] transition-all select-none cursor-pointer ${
                            shadowIntensity === level
                              ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure"
                              : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas padding presets */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-text-muted">Safety Padding Margins</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["Compact", "Standard", "Spacious"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setPaddingLevel(level)}
                          className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold active:scale-[0.98] transition-all select-none cursor-pointer ${
                            paddingLevel === level
                              ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure"
                              : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Canvas alignment grids */}
                  <div className="flex flex-col gap-2 text-left border-t border-border-subtle pt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-text-muted">Canvas Alignment Grid</label>
                      <button
                        onClick={() => setGridVisible(!gridVisible)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md border select-none cursor-pointer transition-all ${
                          gridVisible
                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            : "bg-foreground/[0.02] border-border-medium text-text-muted"
                        }`}
                      >
                        {gridVisible ? "Enabled" : "Disabled"}
                      </button>
                    </div>

                    {gridVisible && (
                      <div className="grid grid-cols-3 gap-1.5 mt-1">
                        {(["dots", "lines", "cross"] as const).map((variant) => (
                          <button
                            key={variant}
                            onClick={() => setGridVariant(variant)}
                            className={`py-1.5 rounded-lg border text-[9px] font-bold capitalize active:scale-[0.98] transition-all select-none cursor-pointer ${
                              gridVariant === variant
                                ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure"
                                : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                            }`}
                          >
                            {variant}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Accordion 5: Typography Overlay */}
            <div>
              <button 
                onClick={() => toggleSection("text")}
                className="w-full flex items-center justify-between text-xs font-extrabold text-foreground-pure pb-2 cursor-pointer select-none"
              >
                <span>5. Typography Overlay</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openSections.text ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openSections.text && (
                <div className="flex flex-col gap-4 mt-3 animate-fade-in">
                  
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-text-muted">Canvas Headline Text</label>
                    <input
                      type="text"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      placeholder="e.g. Try our premium features today!"
                      className="w-full bg-foreground/[0.02] border border-border-medium text-foreground-pure rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-text-muted">Headline Position</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["Top", "Bottom"] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setTextPosition(pos)}
                          className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold active:scale-[0.98] transition-all select-none cursor-pointer ${
                            textPosition === pos
                              ? "border-indigo-500 bg-indigo-500/5 text-foreground-pure"
                              : "border-border-medium bg-foreground/[0.01] hover:bg-foreground/[0.03] text-text-semi-muted"
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size & Custom Color */}
                  <div className="grid grid-cols-2 gap-3.5 border-t border-border-subtle pt-3 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted">Size ({textFontSize}px)</label>
                      <input
                        type="range"
                        min="16"
                        max="64"
                        step="2"
                        value={textFontSize}
                        onChange={(e) => setTextFontSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-text-muted">Weight</label>
                      <select
                        value={textWeight}
                        onChange={(e) => setTextWeight(e.target.value as any)}
                        className="w-full bg-foreground/[0.02] border border-border-medium text-foreground-pure rounded-xl px-2 py-1.5 text-[10px] focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                      >
                        <option value="normal" className="bg-background text-foreground">Regular</option>
                        <option value="medium" className="bg-background text-foreground">Medium</option>
                        <option value="bold" className="bg-background text-foreground">Bold</option>
                        <option value="extrabold" className="bg-background text-foreground">Extra Bold</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Text Color */}
                  <div className="flex flex-col gap-1.5 text-left border-t border-border-subtle pt-3">
                    <label className="text-[10px] font-bold text-text-muted">Custom Typography Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor || (isBgLight ? "#000000" : "#ffffff")}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-9 h-9 rounded-xl border border-border-strong flex-shrink-0 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        placeholder="Auto (contrast matched)"
                        className="flex-1 bg-foreground/[0.02] border border-border-medium text-foreground-pure rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50"
                      />
                      {textColor && (
                        <button
                          onClick={() => setTextColor("")}
                          className="px-2.5 py-2 border border-border-medium hover:border-rose-500/30 text-text-muted hover:text-rose-400 rounded-xl text-[10px] transition-colors cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Usage Metres & Export Button */}
            <div className="border-t border-border-subtle pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-text-muted">Quota Usage:</span>
                  <span className={`font-black ${plan === "free" && userRole !== "admin" && usageCount >= 5 ? "text-rose-400" : "text-indigo-400"}`}>
                    {userRole === "admin" ? (
                      "∞ (Admin Free Access)"
                    ) : (
                      `${usageCount} / ${plan === "free" ? "5" : "∞"} free exports used`
                    )}
                  </span>
                </div>
                {plan === "free" && userRole !== "admin" && (
                  <button
                    type="button"
                    onClick={() => setShowLimitModal(true)}
                    className="text-[10px] font-bold text-pink-400 hover:text-pink-300 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    Upgrade Limit
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={nodes.length === 0}
                onClick={() => setShowPreviewModal(true)}
                className={`w-full font-extrabold text-xs py-3 rounded-2xl border border-border-medium hover:border-indigo-500/30 hover:bg-indigo-500/5 text-foreground-pure transition-all active:scale-[0.98] select-none flex items-center justify-center gap-2 cursor-pointer mb-2.5 ${
                  nodes.length === 0 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Mockup Design
              </button>

              <button
                type="button"
                disabled={nodes.length === 0 || isExporting || (plan === "free" && userRole !== "admin" && usageCount >= 5)}
                onClick={() => handleExport()}
                className={`w-full font-extrabold text-sm py-3.5 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
                  nodes.length === 0
                    ? "bg-foreground/5 text-text-muted border border-border-medium cursor-not-allowed"
                    : plan === "free" && userRole !== "admin" && usageCount >= 5
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/20 cursor-not-allowed"
                      : isExporting
                        ? "bg-indigo-500/80 text-white cursor-wait"
                        : "bg-gradient-to-r from-indigo-500 to-pink-500 text-white hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98]"
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Dynamic PNG...
                  </>
                ) : plan === "free" && userRole !== "admin" && usageCount >= 5 ? (
                  "Limit Reached — Upgrade to Export"
                ) : nodes.length === 0 ? (
                  "Upload Screenshots to Export"
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Premium PNG
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL — Multi-Screen Canva Stacked Slides Sandbox (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8 order-1 lg:order-2">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col text-left gap-1">
              <h3 className="text-sm font-black tracking-[0.08em] text-foreground-pure uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 animate-pulse" />
                Presentation Workspace Stack
              </h3>
              <p className="text-[11px] text-text-muted">
                Manage multiple slides in your presentation. Drag screens inside the active focused board.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Add Slide Header Button */}
              <button
                type="button"
                onClick={handleAddBoard}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/20 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-lg shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer select-none"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Slide</span>
              </button>

              {boards.length > 1 && (
                <button
                  type="button"
                  disabled={isBulkExporting}
                  onClick={handleBulkExport}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider transition-all hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 cursor-pointer disabled:opacity-50 select-none"
                >
                  {isBulkExporting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                      <span>Bulk Exporting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Bulk Export All ({boards.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {boards.map((board, index) => {
              const isActive = board.id === activeBoardId;
              const isLight = board.selectedBg === "white" || board.selectedBg === "candy" || isLightColor(board.customBgColor);
              const gridColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)";
              const bgStyle = board.customBgColor || BACKGROUND_PRESETS.find(bg => bg.id === board.selectedBg)?.style || BACKGROUND_PRESETS[0].style;

              return (
                <div 
                  key={board.id}
                  onClick={() => {
                    if (!isActive) {
                      setActiveBoardId(board.id);
                      hydrateLocalStates(board);
                    }
                  }}
                  className={`border bg-bg-card/45 backdrop-blur-sm rounded-3xl p-4 md:p-6 relative overflow-hidden flex flex-col gap-4 transition-all duration-300 ${
                    isActive 
                      ? "border-indigo-500/80 shadow-[0_0_40px_rgba(99,102,241,0.12)] ring-1 ring-indigo-500/30" 
                      : "border-border-medium hover:border-border-strong hover:scale-[1.002] cursor-pointer"
                  }`}
                >
                  {/* Card Header Top Border Highlight */}
                  <div className={`absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300 ${isActive ? "bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500" : "bg-transparent"}`} />

                  {/* Slide Management Top Bar Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border-subtle/30">
                    <div className="flex items-center gap-3">
                      {/* Slide Number Tag */}
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs">
                        {index + 1}
                      </div>

                      {/* Editable Board Title Input */}
                      <input
                        type="text"
                        value={board.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBoards((prev) => prev.map((b) => (b.id === board.id ? { ...b, title: val } : b)));
                          if (isActive) setTitle(val);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Name your board..."
                        className="bg-transparent border-0 border-b border-transparent hover:border-border-medium focus:border-indigo-500 focus:ring-0 font-extrabold text-foreground-pure text-xs p-0 pb-0.5 rounded-none transition-all w-48 focus:outline-none"
                      />

                      {isActive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full select-none">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          Editing
                        </span>
                      )}
                    </div>

                    {/* Board Slide Action Toolbar */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {/* Reordering Actions */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveBoardUp(index)}
                        className="p-1.5 rounded-lg bg-foreground/[0.02] border border-border-medium hover:bg-foreground/[0.06] text-text-muted hover:text-foreground-pure transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Move Slide Up"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      
                      <button
                        type="button"
                        disabled={index === boards.length - 1}
                        onClick={() => handleMoveBoardDown(index)}
                        className="p-1.5 rounded-lg bg-foreground/[0.02] border border-border-medium hover:bg-foreground/[0.06] text-text-muted hover:text-foreground-pure transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Move Slide Down"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <div className="w-px h-4 bg-border-medium mx-1" />

                      {/* Duplicate Action */}
                      <button
                        type="button"
                        onClick={() => handleDuplicateBoard(board)}
                        className="p-1.5 rounded-lg bg-foreground/[0.02] border border-border-medium hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-indigo-400 text-text-muted transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        title="Duplicate Slide"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        <span className="hidden sm:inline">Duplicate</span>
                      </button>

                      {/* Delete Action */}
                      <button
                        type="button"
                        disabled={boards.length <= 1}
                        onClick={() => handleDeleteBoard(board.id)}
                        className="p-1.5 rounded-lg bg-foreground/[0.02] border border-border-medium hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-text-muted transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        title="Delete Slide"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      <div className="w-px h-4 bg-border-medium mx-1" />

                      {/* Single Download Action */}
                      <button
                        type="button"
                        disabled={board.nodes.length === 0 || isExporting}
                        onClick={() => handleExport(board)}
                        className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-[10px] font-black ${
                          board.nodes.length === 0
                            ? "bg-foreground/5 text-text-muted border-border-medium cursor-not-allowed"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white"
                        }`}
                        title="Download PNG for this slide"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Scaled Responsive Canvas aspect-[16/9] */}
                  <div 
                    ref={isActive ? containerRef : undefined}
                    className={`w-full aspect-[16/9] rounded-2xl overflow-hidden transition-all duration-500 relative select-none border border-border-medium bg-black/10 ${!isActive ? "hover:shadow-md transition-shadow group" : ""}`}
                    style={{ background: bgStyle }}
                  >
                    {isActive ? (
                      // ACTIVE BOARD — Live Bounded React Flow Sandbox
                      !mounted ? (
                        <div className="w-full h-full bg-[#030303] flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div 
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 1200,
                            height: 675,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left"
                          }}
                        >
                          <ReactFlowProvider>
                            <ReactFlow
                              nodes={nodesWithZIndex}
                              onNodesChange={(changes) => {
                                onNodesChange(changes);
                              }}
                              nodeTypes={nodeTypes}
                              fitView={false}
                              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                              minZoom={1}
                              maxZoom={1}
                              panOnScroll={false}
                              zoomOnScroll={false}
                              zoomOnPinch={false}
                              panOnDrag={false}
                              preventScrolling={true}
                              className="w-full h-full"
                            >
                              {/* Grid background layer */}
                              {gridVisible && (
                                <Background 
                                  variant={
                                    gridVariant === "dots" 
                                      ? BackgroundVariant.Dots 
                                      : gridVariant === "lines" 
                                      ? BackgroundVariant.Lines 
                                      : BackgroundVariant.Cross
                                  } 
                                  size={1.5} 
                                  gap={24}
                                  color="var(--grid-line)"
                                  style={{ opacity: 0.12 }}
                                />
                              )}

                              {/* Text Overlay inside sandbox */}
                              {textOverlay && (
                                <div 
                                  className="absolute left-0 right-0 flex justify-center pointer-events-none z-50 px-6"
                                  style={{
                                    top: textPosition === "Top" ? 40 : "auto",
                                    bottom: textPosition === "Bottom" ? 40 : "auto",
                                  }}
                                >
                                  <span 
                                    className="tracking-tight drop-shadow-md select-none text-center leading-none"
                                    style={{
                                      fontSize: `${textFontSize}px`,
                                      fontWeight: textWeight === "normal" ? 400 : textWeight === "medium" ? 500 : textWeight === "bold" ? 700 : 800,
                                      color: textColor || (isBgLight ? "#000000" : "#ffffff"),
                                    }}
                                  >
                                    {textOverlay}
                                  </span>
                                </div>
                              )}

                              {/* Inset Safety Padding Presets Guidance Border */}
                              <div 
                                className="absolute rounded-xl border border-dashed border-white/5 pointer-events-none transition-all duration-300"
                                style={{
                                  inset: paddingLevel === "Compact" ? "20px" : paddingLevel === "Spacious" ? "80px" : "48px",
                                  opacity: 0.5
                                }}
                              />
                            </ReactFlow>
                          </ReactFlowProvider>

                          {/* Live Canvas Watermark for Free Plan users (exempting Admins) */}
                          {plan === "free" && userRole !== "admin" && (
                            <div 
                              className="absolute bottom-6 right-6 z-[100] pointer-events-none select-none flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md animate-fade-in"
                              style={{
                                backgroundColor: "rgba(15, 23, 42, 0.45)",
                              }}
                            >
                              <img 
                                src="/logo.png" 
                                alt="Muckly Logo" 
                                className="w-5 h-5 rounded-md border border-white/10 shadow-md object-cover mr-2"
                              />
                              <span className="text-[10px] font-black tracking-[0.12em] text-white uppercase font-sans">
                                Muckly
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      // INACTIVE BOARD — High Fidelity Static Canvas Render with identical visuals
                      <div 
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: 1200,
                          height: 675,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left"
                        }}
                        className="w-full h-full relative"
                      >
                        {/* CSS Grid Layer */}
                        {board.gridVisible && (
                          <div 
                            className="absolute inset-0 pointer-events-none opacity-[0.12]"
                            style={{
                              backgroundImage: board.gridVariant === "dots" 
                                ? `radial-gradient(${gridColor} 1.5px, transparent 1.5px)` 
                                : `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                              backgroundSize: "24px 24px"
                            }}
                          />
                        )}

                        {/* Text Overlay Layer */}
                        {board.textOverlay && (
                          <div 
                            className="absolute left-0 right-0 flex justify-center pointer-events-none z-50 px-6"
                            style={{
                              top: board.textPosition === "Top" ? 40 : "auto",
                              bottom: board.textPosition === "Bottom" ? 40 : "auto",
                            }}
                          >
                            <span 
                              className="tracking-tight drop-shadow-md select-none text-center leading-none"
                              style={{
                                fontSize: `${board.textFontSize}px`,
                                fontWeight: board.textWeight === "normal" ? 400 : board.textWeight === "medium" ? 500 : board.textWeight === "bold" ? 700 : 800,
                                color: board.textColor || (isLight ? "#000000" : "#ffffff"),
                              }}
                            >
                              {board.textOverlay}
                            </span>
                          </div>
                        )}

                        {/* Inset safety boundary guide */}
                        <div 
                          className="absolute rounded-xl border border-dashed border-white/5 pointer-events-none transition-all duration-300"
                          style={{
                            inset: board.paddingLevel === "Compact" ? "20px" : board.paddingLevel === "Spacious" ? "80px" : "48px",
                            opacity: 0.5
                          }}
                        />

                        {/* Static Device Mockups Render Map */}
                        {board.nodes.map((node) => (
                          <div
                            key={node.id}
                            className="absolute pointer-events-none"
                            style={{
                              left: node.position?.x ?? 0,
                              top: node.position?.y ?? 0,
                            }}
                          >
                            <StaticDeviceMockup node={node} shadowIntensity={board.shadowIntensity} />
                          </div>
                        ))}

                        {/* Live Canvas Watermark for Free Plan users (exempting Admins) */}
                        {plan === "free" && userRole !== "admin" && (
                          <div 
                            className="absolute bottom-6 right-6 z-[100] pointer-events-none select-none flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md animate-fade-in"
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.45)",
                            }}
                          >
                            <img 
                              src="/logo.png" 
                              alt="Muckly Logo" 
                              className="w-5 h-5 rounded-md border border-white/10 shadow-md object-cover mr-2"
                            />
                            <span className="text-[10px] font-black tracking-[0.12em] text-white uppercase font-sans">
                              Muckly
                            </span>
                          </div>
                        )}

                        {/* Hover Click overlay */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-auto">
                          <div className="flex items-center gap-2 bg-[#090b11]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-md px-5 py-3 rounded-2xl scale-95 group-hover:scale-100 transition-all select-none">
                            <svg className="w-4 h-4 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="text-xs font-extrabold text-foreground-pure uppercase tracking-wider">
                              Click slide board to edit
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center gap-1.5 justify-center border border-border-subtle bg-foreground/[0.01] rounded-2xl px-4 py-2">
                      <span className="text-[10px] text-text-dim leading-none text-center">
                        👉 Click a screen to select & configure bezel finish or presentation tilt details. Drag mockups to arrange them freely on the active canvas!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Board Slide Trigger */}
            <button
              type="button"
              onClick={handleAddBoard}
              className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all rounded-3xl p-8 flex flex-col items-center justify-center gap-3 group cursor-pointer text-center"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg shadow-indigo-500/5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h4 className="text-xs font-black text-foreground-pure transition-colors group-hover:text-indigo-400 uppercase tracking-widest">
                + Add New Board Slide Page
              </h4>
              <p className="text-[10px] text-text-muted leading-normal max-w-sm">
                Insert a clean, separate Canva slide board stacked below to upload and arrange more screenshots.
              </p>
            </button>
          </div>
        </div>

      </div>

      {/* Mockup Gallery */}
      <div className="border-t border-border-subtle pt-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-left">
          <h3 className="text-base font-extrabold text-foreground-pure">Mockup Gallery</h3>
          <p className="text-xs text-text-muted">View and download your past generated mockups.</p>
        </div>

        {mockupsList.length === 0 ? (
          <div className="border border-dashed border-border-medium rounded-3xl p-10 text-center flex flex-col items-center justify-center bg-foreground/[0.01]">
            <svg className="w-8 h-8 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
            </svg>
            <h4 className="text-xs font-bold text-foreground-pure mb-1">No exported mockups yet</h4>
            <p className="text-[10px] text-text-muted max-w-xs leading-normal">
              Any mockup you generate will be permanently hosted and shown here for instant download access.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockupsList.map((m) => (
              <div 
                key={m.id}
                className="border border-border-medium bg-bg-card/40 rounded-2xl overflow-hidden flex flex-col hover:border-border-strong hover:scale-[1.01] transition-all relative group"
              >
                {/* 100% Fidelity Thumbnail - renders compiled high-res PNG directly */}
                <div className="aspect-[16/9] w-full relative overflow-hidden bg-black/10 border-b border-border-subtle flex items-center justify-center">
                  {m.mockupUrl ? (
                    <img 
                      src={m.mockupUrl} 
                      alt={m.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102" 
                    />
                  ) : (
                    <div className="text-text-dim text-[10px] font-semibold italic">No Thumbnail</div>
                  )}
                </div>

                {/* Footer info logs */}
                <div className="p-4 flex items-center justify-between text-xs text-left bg-foreground/[0.01]">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-foreground-pure tracking-tight line-clamp-1">{m.title}</span>
                    <span className="text-[9px] text-text-muted">
                      {m.deviceFrame || "Multi-screen"} • {m.tilt || "Custom Layout"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.mockupUrl && (
                      <button
                        onClick={() => handleDirectDownload(
                          m.mockupUrl!,
                          `${m.title.replace(/\s+/g, "-").toLowerCase()}-mockup.png`
                        )}
                        className="p-2 rounded-xl bg-foreground/[0.03] border border-border-medium hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-indigo-400 text-foreground-pure transition-all active:scale-95 flex items-center justify-center select-none cursor-pointer"
                        title="Download to computer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteMockup(m.id)}
                      className="p-2 rounded-xl bg-foreground/[0.03] border border-border-medium hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-foreground-pure transition-all active:scale-95 flex items-center justify-center select-none cursor-pointer"
                      title="Delete mockup"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
