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

  // Pixel-perfect semi-circle arc math
  const width = 240;
  const height = 135;
  const strokeWidth = 18;
  const radius = 86;
  const centerX = width / 2;
  const centerY = height - 12;
  const arcLength = Math.PI * radius; // ~270.18
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[32px] border border-white/20 bg-gradient-to-b from-[#6b35f7] via-[#5c27e8] to-[#4412c1] p-6 sm:p-7 text-white shadow-[0_24px_50px_rgba(105,54,245,0.45)] transition duration-300 hover:shadow-[0_28px_60px_rgba(105,54,245,0.52)]">
      {/* Ambient background glassmorphism lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-black/25 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-white/10 via-transparent to-transparent opacity-60" />

      {/* Top row: 3-dots menu button */}
      <div className="relative z-10 flex items-center justify-end">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label="Options"
        >
          <MoreVertical size={19} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 w-48 rounded-2xl border border-white/25 bg-[#3e14a8]/95 p-2 text-[12px] font-semibold text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
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
      <div className="relative z-10 my-2 flex flex-col items-center justify-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible select-none"
        >
          <defs>
            {/* Smooth transition: Lime Green -> Golden Yellow -> Sky Blue */}
            <linearGradient id="speedoGaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="30%" stopColor="#eab308" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>

            <filter id="gaugeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Solid White Track Arc (Matching reference screenshot exactly) */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Foreground Progress Arc (covering 45% with vibrant gradient) */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="url(#speedoGaugeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Center 45% text positioned perfectly in the open center with ample breathing room */}
          <text
            x={centerX}
            y={centerY - 22}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            className="font-black text-[38px] tracking-tight drop-shadow-md"
            style={{ fontWeight: 900 }}
          >
            {clamped}%
          </text>
        </svg>
      </div>

      {/* Bottom Information */}
      <div className="relative z-10 flex flex-col items-center text-center mt-3">
        {/* Soft rounded icon square with upward trend line */}
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 border border-white/25 shadow-sm backdrop-blur-md">
          <TrendingUp size={20} strokeWidth={2.4} className="text-white" />
        </div>

        <span className="text-[13px] font-semibold text-white/85 tracking-wide">
          Amount Owed
        </span>

        <div className="mt-1 text-3xl sm:text-[34px] font-black tracking-tight text-white drop-shadow-sm leading-tight">
          {amountOwed}
        </div>

        <div className="mt-1 text-[13px] font-medium text-white/70">
          {secondaryAmount}
        </div>
      </div>
    </div>
  );
}
