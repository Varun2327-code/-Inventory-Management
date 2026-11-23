"use client";

import React, { useState } from "react";
import { ChevronDown, Search, HelpCircle, Bell, User, Check } from "lucide-react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [subtitleDropdownOpen, setSubtitleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Your weekly Financial update");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="relative flex flex-wrap items-center justify-between gap-4 py-3">
      {/* Greeting & Subtitle with Dropdown */}
      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#141031]">
          Good Morning David
        </h1>

        <div className="relative mt-1">
          <button
            onClick={() => setSubtitleDropdownOpen(!subtitleDropdownOpen)}
            className="flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-[#141031] transition"
          >
            <span>{selectedPeriod}</span>
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${
                subtitleDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Subtitle dropdown menu */}
          {subtitleDropdownOpen && (
            <div className="absolute left-0 top-7 z-30 w-60 rounded-2xl border border-line bg-white p-2 text-[12px] font-bold text-[#141031] shadow-xl animate-in fade-in zoom-in-95">
              {[
                "Your weekly Financial update",
                "Your monthly Financial summary",
                "Quarterly Capital Report",
                "Annual Overview 2026",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSelectedPeriod(item);
                    setSubtitleDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    selectedPeriod === item
                      ? "bg-purple-50 text-[#6835f1]"
                      : "text-[#141031] hover:bg-[#f4f6fe]"
                  }`}
                >
                  <span>{item}</span>
                  {selectedPeriod === item && <Check size={14} className="text-[#6835f1]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Search bar, Help, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search transactions, bills..."
            className="w-48 sm:w-64 rounded-2xl border border-[#e8ebf7] bg-white py-2.5 pl-10 pr-4 text-[12px] font-semibold text-[#141031] shadow-[0_4px_16px_rgba(95,45,235,0.04)] outline-none transition focus:border-[#6835f1] focus:ring-2 focus:ring-[#6835f1]/10 placeholder:text-muted/70"
          />
        </div>

        {/* Help Icon */}
        <button
          onClick={() => alert("StockPilot Financial Help Center: Need help? Contact support@stockpilot.io")}
          title="Help & Documentation"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e8ebf7] bg-white text-muted hover:border-[#6835f1]/40 hover:text-[#6835f1] shadow-[0_4px_16px_rgba(95,45,235,0.04)] transition active:scale-95"
        >
          <HelpCircle size={18} strokeWidth={2} />
        </button>

        {/* Notification Icon with Small Red Dot */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e8ebf7] bg-white text-muted hover:border-[#6835f1]/40 hover:text-[#6835f1] shadow-[0_4px_16px_rgba(95,45,235,0.04)] transition active:scale-95"
          >
            <Bell size={18} strokeWidth={2} />
            {/* Small red notification dot */}
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-line bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
                <span className="text-[12px] font-bold text-[#141031]">Notifications</span>
                <span className="text-[10px] font-semibold text-[#6835f1]">2 new</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="rounded-xl bg-[#f8f9fe] p-2">
                  <div className="font-bold text-[#141031]">Invoice INV-1089 Paid</div>
                  <div className="text-[10px] text-muted">Northstar Studio settled $1,248.00</div>
                </div>
                <div className="rounded-xl bg-amber-50 p-2 text-amber-900">
                  <div className="font-bold">5 Items Low Stock</div>
                  <div className="text-[10px] text-amber-700">Reorder threshold reached</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Circular User Profile Avatar (David) */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full p-0.5 transition hover:ring-2 hover:ring-[#6835f1]/30 active:scale-95"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
              alt="David"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 z-30 w-52 rounded-2xl border border-line bg-white p-2.5 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="border-b border-line pb-2 mb-2 px-1">
                <div className="font-bold text-[#141031] text-[13px]">David Martinez</div>
                <div className="text-[11px] text-muted">david@financial.org</div>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full rounded-xl px-2.5 py-1.5 text-left text-[12px] font-semibold hover:bg-[#f4f6fe] transition"
              >
                Profile & Account
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full rounded-xl px-2.5 py-1.5 text-left text-[12px] font-semibold hover:bg-[#f4f6fe] transition"
              >
                Billing Preferences
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full rounded-xl px-2.5 py-1.5 text-left text-[12px] font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
