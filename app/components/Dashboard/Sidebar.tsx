"use client";

import React from "react";
import {
  LayoutDashboard,
  CreditCard,
  Rocket,
  MessageSquare,
  FileText,
  Settings,
  LucideIcon,
} from "lucide-react";

export type NavItemKey =
  | "dashboard"
  | "analytics"
  | "users"
  | "messages"
  | "documents"
  | "settings";

interface SidebarProps {
  activeItem: NavItemKey;
  onSelect: (item: NavItemKey) => void;
}

interface NavButton {
  key: NavItemKey;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavButton[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: CreditCard },
  { key: "users", label: "Users & Teams", icon: Rocket },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "documents", label: "Documents", icon: FileText },
];

export default function Sidebar({ activeItem, onSelect }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[88px] flex-col items-center justify-between border-r border-[#e8ebf7] bg-[#f9faff]/80 py-7 shadow-[0_8px_30px_rgba(95,45,235,0.03)] backdrop-blur-xl">
      {/* Top Stylized "A" Logo (exact match to screenshot) */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSelect("dashboard")}
          className="group relative flex h-12 w-12 items-center justify-center transition active:scale-95"
          aria-label="StockPilot Logo"
        >
          {/* Stylized Geometric "A" Glyph matching screenshot */}
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-105"
          >
            <path
              d="M17 3L3.5 28.5H11.5L17 17.5L22.5 28.5H30.5L17 3Z"
              fill="url(#logoGrad)"
            />
            <path
              d="M17 11L10 24H24L17 11Z"
              fill="#ffffff"
              fillOpacity="0.15"
            />
            <defs>
              <linearGradient
                id="logoGrad"
                x1="3.5"
                y1="3"
                x2="28"
                y2="28.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3b82f6" />
                <stop offset="0.5" stopColor="#6835f1" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </button>
      </div>

      {/* Vertical Navigation Pill / Floating Wave Dock */}
      <div className="relative flex flex-col items-center gap-3">
        {/* Curved purple dock pill for icons */}
        <div className="relative flex flex-col items-center gap-2 rounded-[30px] bg-gradient-to-b from-[#6835f1] via-[#7534f5] to-[#5116cb] p-2.5 shadow-[0_16px_36px_rgba(104,53,241,0.38)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                title={item.label}
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition duration-200 active:scale-95 ${
                  isActive
                    ? "bg-white text-[#6835f1] shadow-md shadow-black/10 font-bold"
                    : "text-white/75 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.9} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Settings Icon */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSelect("settings")}
          title="Settings"
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition duration-200 active:scale-95 ${
            activeItem === "settings"
              ? "bg-[#6835f1] text-white shadow-lg"
              : "text-muted hover:bg-white hover:text-[#141031] shadow-xs"
          }`}
        >
          <Settings size={20} strokeWidth={1.9} />
        </button>
      </div>
    </aside>
  );
}
