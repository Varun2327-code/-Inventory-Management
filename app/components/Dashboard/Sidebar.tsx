"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Truck,
  Building2,
  BarChart3,
  Clock,
  Settings,
  LucideIcon,
} from "lucide-react";

export type NavItemKey =
  | "dashboard"
  | "stock"
  | "sales"
  | "purchases"
  | "godowns"
  | "reports"
  | "movements"
  | "settings";

interface SidebarProps {
  activeItem: NavItemKey;
  onSelect: (item: NavItemKey) => void;
  lowStockCount?: number;
  pendingPurchasesCount?: number;
}

interface NavButton {
  key: NavItemKey;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
}

export default function Sidebar({
  activeItem,
  onSelect,
  lowStockCount = 0,
  pendingPurchasesCount = 0,
}: SidebarProps) {
  const NAV_ITEMS: NavButton[] = [
    { key: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { key: "stock", label: "Stock & Catalog", icon: Package, badgeCount: lowStockCount },
    { key: "sales", label: "Sales & Invoices", icon: CreditCard },
    { key: "purchases", label: "Purchase Orders", icon: Truck, badgeCount: pendingPurchasesCount },
    { key: "godowns", label: "Godowns & Warehouses", icon: Building2 },
    { key: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { key: "movements", label: "Stock Movement Log", icon: Clock },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[88px] flex-col items-center justify-between border-r border-[#e8ebf7] bg-[#f9faff]/85 py-6 shadow-[0_8px_30px_rgba(95,45,235,0.03)] backdrop-blur-xl">
      {/* Top Stylized "A" Logo */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSelect("dashboard")}
          className="group relative flex h-12 w-12 items-center justify-center transition active:scale-95"
          aria-label="StockPilot Logo"
          title="StockPilot Dashboard"
        >
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
              fill="url(#sidebarLogoGrad)"
            />
            <path
              d="M17 11L10 24H24L17 11Z"
              fill="#ffffff"
              fillOpacity="0.18"
            />
            <defs>
              <linearGradient
                id="sidebarLogoGrad"
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

      {/* Vertical Navigation Floating Dock */}
      <div className="relative flex flex-col items-center my-auto">
        <div className="relative flex flex-col items-center gap-1.5 rounded-[32px] bg-gradient-to-b from-[#6835f1] via-[#7534f5] to-[#5116cb] p-2 shadow-[0_16px_36px_rgba(104,53,241,0.38)]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                title={item.label}
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition duration-200 active:scale-95 ${
                  isActive
                    ? "bg-white text-[#6835f1] shadow-md shadow-black/10 font-bold"
                    : "text-white/75 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.9} />

                {/* Optional notification badge dot */}
                {Boolean(item.badgeCount && item.badgeCount > 0) && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white">
                    {item.badgeCount}
                  </span>
                )}
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
