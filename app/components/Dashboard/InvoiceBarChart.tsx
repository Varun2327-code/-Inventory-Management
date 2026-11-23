"use client";

import React, { useState } from "react";
import { MoreVertical, TrendingUp, Calendar } from "lucide-react";

interface MonthlyBarData {
  month: string;
  year: string;
  amount: number;
  heightPct: number;
  shade: string;
}

const MONTH_DATA: MonthlyBarData[] = [
  { month: "Feb", year: "2021", amount: 2840, heightPct: 48, shade: "#c8bdfc" },
  { month: "Mar", year: "2021", amount: 4820, heightPct: 82, shade: "#6835f1" },
  { month: "Apr", year: "2021", amount: 3350, heightPct: 56, shade: "#a78bfa" },
  { month: "May", year: "2021", amount: 4120, heightPct: 70, shade: "#7c3aed" },
  { month: "Jun", year: "2021", amount: 3740, heightPct: 64, shade: "#8b5cf6" },
  { month: "Jul", year: "2021", amount: 4950, heightPct: 86, shade: "#6366f1" },
  { month: "Aug", year: "2021", amount: 4400, heightPct: 74, shade: "#703bf7" },
  { month: "Sep", year: "2021", amount: 5600, heightPct: 96, shade: "#581c87" },
];

export default function InvoiceBarChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(1); // Default highlight on March 2021 as in reference
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex h-full flex-col justify-between rounded-[28px] border border-[#e8ebf7] bg-white p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)] transition duration-200 hover:shadow-[0_16px_40px_rgba(95,45,235,0.09)]">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#f0f2fa] pb-4">
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-[#141031]">
            Invoice Analytics
          </h3>
          <p className="mt-0.5 text-[11px] font-semibold text-muted">
            Monthly billing progression
          </p>
        </div>

        {/* 3-dots Menu with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full p-1.5 text-muted hover:bg-[#f3f5fd] hover:text-[#141031] transition"
            aria-label="Options"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-44 rounded-2xl border border-line bg-white p-2 text-[12px] font-bold text-[#141031] shadow-2xl animate-in fade-in zoom-in-95">
              <button
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-[#f3f5fd] hover:text-brand transition"
              >
                <Calendar size={14} className="text-brand" />
                Yearly Statement
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-[#f3f5fd] hover:text-brand transition"
              >
                <TrendingUp size={14} className="text-brand" />
                View History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Bar Chart with Active Tooltip */}
      <div className="relative my-4 flex h-[195px] items-end justify-between gap-2 sm:gap-3 px-2 pt-8">
        {MONTH_DATA.map((item, idx) => {
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.month}
              onMouseEnter={() => setHoveredIdx(idx)}
              className="group relative flex flex-1 flex-col items-center justify-end h-full cursor-pointer"
            >
              {/* Tooltip: e.g. "Mar 2021 · $4,820" */}
              {isHovered && (
                <div className="absolute -top-6 z-20 whitespace-nowrap rounded-xl bg-[#1d173c] px-2.5 py-1 text-[10px] font-black text-white shadow-xl animate-in fade-in duration-150">
                  <span>
                    {item.month} {item.year}
                  </span>
                  <span className="ml-1 text-purple-300">· ${item.amount.toLocaleString()}</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1d173c]" />
                </div>
              )}

              {/* Bar element */}
              <div
                className={`w-full max-w-[36px] rounded-t-2xl rounded-b-md transition-all duration-300 ${
                  isHovered ? "scale-y-[1.02] shadow-md shadow-purple-500/25" : ""
                }`}
                style={{
                  height: `${item.heightPct}%`,
                  backgroundColor: item.shade,
                }}
              />

              {/* Month Label */}
              <span
                className={`mt-2 text-[11px] font-bold transition-colors ${
                  isHovered ? "text-[#6835f1]" : "text-muted"
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subtext info */}
      <div className="flex items-center justify-between border-t border-[#f0f2fa] pt-3 text-[11px] font-semibold text-muted">
        <span>Average monthly revenue: $4,197.50</span>
        <span className="font-bold text-[#6835f1]">+14.6% vs previous cycle</span>
      </div>
    </div>
  );
}
