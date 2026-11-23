"use client";

import React, { useState } from "react";
import { MoreVertical, TrendingUp } from "lucide-react";

interface SpeedometerCardProps {
  percentage?: number;
  amountOwed?: string;
  secondaryAmount?: string;
}

export default function SpeedometerCard({
  percentage = 45,
  amountOwed = "$933,879.45",
  secondaryAmount = "$126,783.89",
}: SpeedometerCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Precision semi-circle SVG dimensions
  const width = 210;
  const height = 125;
  const strokeWidth = 16;
  const radius = 80;
  const centerX = width / 2;
  const centerY = height - 10;
  const arcLength = Math.PI * radius; // ~251.3
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-b from-[#6936f5] via-[#5d2be7] to-[#4514ba] p-6 text-white shadow-[0_20px_48px_rgba(105,54,245,0.4)] transition duration-300 hover:shadow-[0_24px_55px_rgba(105,54,245,0.48)]">
      {/* Ambient background glow highlights */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/20 blur-2xl" />

      {/* Top row: 3-dots menu button */}
      <div className="relative z-10 flex items-center justify-end">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label="Options"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl border border-white/20 bg-[#4217af]/95 p-2 text-[12px] font-semibold text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/15"
            >
              View Full Statement
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/15"
            >
              Export PDF Receipt
            </button>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-xl px-3 py-2 text-left text-rose-300 transition hover:bg-white/15"
            >
              Recalculate Balance
            </button>
          </div>
        )}
      </div>

      {/* Speedometer Radial Gauge */}
      <div className="relative z-10 my-1 flex flex-col items-center justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="speedoGaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#facc15" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="speedoGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Foreground Progress Arc */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="url(#speedoGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#speedoGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display inside the semi-circle */}
        <div className="absolute top-[32%] flex flex-col items-center justify-center">
          <span className="text-[34px] font-black tracking-tight text-white drop-shadow-md leading-none">
            {clamped}%
          </span>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="relative z-10 flex flex-col items-center text-center mt-2">
        {/* Soft rounded icon square */}
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-xs backdrop-blur-md">
          <TrendingUp size={18} strokeWidth={2.2} />
        </div>

        <span className="text-[12px] font-semibold text-white/80">Amount Owed</span>

        <div className="mt-1 text-2xl sm:text-[28px] font-black tracking-tight text-white drop-shadow-sm leading-tight">
          {amountOwed}
        </div>

        <div className="mt-1 text-[12px] font-medium text-white/70">
          {secondaryAmount}
        </div>
      </div>
    </div>
  );
}
