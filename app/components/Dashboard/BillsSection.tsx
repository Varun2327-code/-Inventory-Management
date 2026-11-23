"use client";

import React from "react";
import { CalendarCheck, FileText, CalendarX, HelpCircle, LucideIcon } from "lucide-react";
import MiniProgressCircle from "./MiniProgressCircle";

export interface BillsSectionProps {
  totalUnits?: number;
  activeSkus?: number;
  salesCount?: number;
  salesRevenue?: string;
  lowStockCount?: number;
  pendingPurchasesCount?: number;
  pendingPurchasesAmount?: string;
}

export default function BillsSection({
  totalUnits = 412,
  activeSkus = 8,
  salesCount = 4,
  salesRevenue = "$3,764.00",
  lowStockCount = 1,
  pendingPurchasesCount = 2,
  pendingPurchasesAmount = "$1,240.00",
}: BillsSectionProps) {
  const cards = [
    {
      id: "card-1",
      label: "Ready to fulfill",
      value: `${totalUnits} Units`,
      subValue: `${activeSkus} SKUs active`,
      progressValue: 32,
      progressLabel: "+32%",
      progressColor: "#6835f1",
      description: "Inventory stock on warehouse floor",
      icon: CalendarCheck,
      iconBg: "#f3f5fd",
      iconColor: "#1d173c",
      accentColor: "#6835f1",
    },
    {
      id: "card-2",
      label: "Pending sign offs",
      value: `${salesCount} Invoices`,
      subValue: salesRevenue,
      progressValue: 22,
      progressLabel: "+22%",
      progressColor: "#7c3aed",
      description: "Sales orders in fulfillment pipeline",
      icon: FileText,
      iconBg: "#f3f5fd",
      iconColor: "#1d173c",
      accentColor: "#7c3aed",
    },
    {
      id: "card-3",
      label: "Low Stock Alert",
      value: `${lowStockCount} Items`,
      subValue: "Below min buffer",
      progressValue: lowStockCount > 0 ? -Math.min(100, lowStockCount * 10) : 0,
      progressLabel: lowStockCount > 0 ? `-${lowStockCount * 5}%` : "0%",
      progressColor: "#f43f5e",
      description: "SKUs requiring immediate restocking",
      icon: CalendarX,
      iconBg: "#fff3f5",
      iconColor: "#f43f5e",
      accentColor: "#f43f5e",
    },
    {
      id: "card-4",
      label: "Pending PO Deliveries",
      value: `${pendingPurchasesCount} Shipments`,
      subValue: pendingPurchasesAmount,
      progressValue: 15,
      progressLabel: "+15%",
      progressColor: "#0ea5e9",
      description: "Vendor restocks in transit to godown",
      icon: HelpCircle,
      iconBg: "#f0f9ff",
      iconColor: "#0ea5e9",
      accentColor: "#0ea5e9",
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-xl font-black tracking-tight text-[#141031]">Bills & Inventory Pulse</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="relative flex min-h-[175px] flex-col justify-between rounded-[28px] border border-[#e8ebf7] bg-gradient-to-br from-white via-white to-[#fafbff] p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(95,45,235,0.1)]"
            >
              {/* Subtle decorative curved accent pill on right border */}
              <div
                className="pointer-events-none absolute right-0 top-1/2 h-12 w-1.5 -translate-y-1/2 rounded-l-full opacity-50"
                style={{ backgroundColor: card.accentColor }}
              />

              {/* Top Row: Icon on left, Mini circular progress on right */}
              <div className="flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#edeef6]"
                  style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                >
                  <Icon size={19} strokeWidth={1.9} />
                </div>

                <MiniProgressCircle
                  value={card.progressValue}
                  displayLabel={card.progressLabel}
                  color={card.progressColor}
                />
              </div>

              {/* Body: Label, Big Value, Description */}
              <div className="mt-4 flex flex-col">
                <span className="text-[12px] font-bold text-muted">{card.label}</span>
                <div className="mt-1 text-[24px] sm:text-[26px] font-black tracking-tight text-[#141031] leading-none">
                  {card.value}
                </div>
                <p className="mt-2 text-[11px] font-semibold text-muted/80 leading-normal">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
