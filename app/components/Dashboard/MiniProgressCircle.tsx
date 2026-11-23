"use client";

import React from "react";

interface MiniProgressCircleProps {
  value: number; // e.g. 32, 22, -5, 85
  displayLabel?: string; // e.g. "+32%", "-5%", "85%"
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export default function MiniProgressCircle({
  value,
  displayLabel,
  size = 46,
  strokeWidth = 3.5,
  color,
  trackColor = "#eceef7",
}: MiniProgressCircleProps) {
  const isNegative = value < 0;
  const label = displayLabel ?? (isNegative ? `${value}%` : `+${value}%`);
  const activeColor = color ?? (isNegative ? "#f43f5e" : "#6835f1");

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const absValue = Math.min(100, Math.max(0, Math.abs(value)));
  const offset = circumference - (absValue / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className={`absolute text-[10px] font-black tracking-tight ${
          isNegative ? "text-rose-500" : "text-[#1d173c]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
