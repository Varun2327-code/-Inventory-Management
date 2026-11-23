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

  // Half-circle SVG math
  const size = 220;
  const strokeWidth = 15;
  const radius = (size - strokeWidth * 2) / 2;
  const arcLength = Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-[#6835f1] via-[#7335f7] to-[#4f18ce] p-6 text-white shadow-[0_22px_50px_rgba(104,53,241,0.42)] transition duration-300 hover:shadow-[0_26px_60px_rgba(104,53,241,0.5)]">
      {/* Ambient background glow highlights */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-black/25 blur-2xl" />

      {/* Top 3-dots menu button */}
      <div className="relative z-10 flex items-center justify-end">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label="Options"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl border border-white/20 bg-[#4217af]/90 p-2 text-[12px] font-semibold text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
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
          width={size}
          height={size / 2 + 30}
          viewBox={`0 0 ${size} ${size / 2 + 30}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="75%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="gaugeDrop" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth + 5} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth - 5} ${size / 2 + 10}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Foreground Progress Arc */}
          <path
            d={`M ${strokeWidth + 5} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth - 5} ${size / 2 + 10}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeDrop)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute top-[35%] flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tight text-white drop-shadow-md">
            {clamped}%
          </span>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Soft rounded icon square */}
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-xs backdrop-blur-md">
          <TrendingUp size={18} strokeWidth={2.2} />
        </div>

        <span className="text-[12px] font-semibold text-white/80">Amount Owed</span>

        <div className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
          {amountOwed}
        </div>

        <div className="mt-1 text-[13px] font-semibold text-white/70">
          {secondaryAmount}
        </div>
      </div>
    </div>
  );
}
