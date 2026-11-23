"use client";

import React from "react";

interface CircularMiniGaugeProps {
  value: number; // e.g. 42 or -5
  label?: string; // e.g. "+42%" or "-5%"
  size?: number;
  strokeWidth?: number;
  color?: string; // e.g. "#6366f1"
  trackColor?: string;
}

export function CircularMiniGauge({
  value,
  label,
  size = 46,
  strokeWidth = 3.5,
  color = "#6366f1",
  trackColor = "#eef0f8",
}: CircularMiniGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const absValue = Math.min(100, Math.max(0, Math.abs(value)));
  const strokeDashoffset = circumference - (absValue / 100) * circumference;
  const displayLabel = label ?? `${value > 0 ? "+" : ""}${value}%`;
  const isNegative = value < 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
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
          stroke={isNegative ? "#f43f5e" : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className={`absolute text-[10px] font-bold tracking-tight ${
          isNegative ? "text-rose-500" : "text-[#1e1b4b]"
        }`}
      >
        {displayLabel}
      </span>
    </div>
  );
}

interface SpeedometerGaugeProps {
  percentage: number; // e.g. 45
  size?: number;
}

export function SpeedometerGauge({ percentage = 45, size = 200 }: SpeedometerGaugeProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  // Arc from 180 to 0 degrees (half circle)
  const arcLength = Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size / 2 + 25} viewBox={`0 0 ${size} ${size / 2 + 25}`}>
        <defs>
          <linearGradient id="speedometerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="70%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track (semi-circle) */}
        <path
          d={`M ${strokeWidth + 5} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth - 5} ${size / 2 + 10}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Foreground colored arc */}
        <path
          d={`M ${strokeWidth + 5} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth - 5} ${size / 2 + 10}`}
          fill="none"
          stroke="url(#speedometerGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Centered Percentage readout */}
      <div className="absolute top-[38%] flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
          {clamped}%
        </span>
      </div>
    </div>
  );
}
