"use client";

import React from "react";
import { CalendarCheck, FileText, CalendarX, HelpCircle, LucideIcon } from "lucide-react";
import MiniProgressCircle from "./MiniProgressCircle";

interface BillCardItem {
  id: string;
  label: string;
  value: string;
  progressValue: number;
  progressLabel: string;
  progressColor?: string;
  description: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  accentColor: string;
}

const BILLS_CARDS: BillCardItem[] = [
  {
    id: "card-1",
    label: "Ready to assign",
    value: "200 - 42",
    progressValue: 32,
    progressLabel: "+32%",
    progressColor: "#6835f1",
    description: "Bills in this week 221",
    icon: CalendarCheck,
    iconBg: "#f3f5fd",
    iconColor: "#1d173c",
    accentColor: "#6835f1",
  },
  {
    id: "card-2",
    label: "Pending sign offs",
    value: "63 - 17",
    progressValue: 22,
    progressLabel: "+22%",
    progressColor: "#7c3aed",
    description: "Signed off in this week 221",
    icon: FileText,
    iconBg: "#f3f5fd",
    iconColor: "#1d173c",
    accentColor: "#7c3aed",
  },
  {
    id: "card-3",
    label: "Declined",
    value: "5",
    progressValue: -5,
    progressLabel: "-5%",
    progressColor: "#f43f5e",
    description: "Declined this week 2",
    icon: CalendarX,
    iconBg: "#fff3f5",
    iconColor: "#f43f5e",
    accentColor: "#f43f5e",
  },
  {
    id: "card-4",
    label: "RFI",
    value: "13 - 17",
    progressValue: 5,
    progressLabel: "+5%",
    progressColor: "#0ea5e9",
    description: "Requested this week 2",
    icon: HelpCircle,
    iconBg: "#f0f9ff",
    iconColor: "#0ea5e9",
    accentColor: "#0ea5e9",
  },
];

export default function BillsSection() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-black tracking-tight text-[#141031]">Bills</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {BILLS_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-[#e8ebf7] bg-gradient-to-br from-white via-white to-[#fafbff] p-5.5 shadow-[0_12px_32px_rgba(95,45,235,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(95,45,235,0.1)]"
            >
              {/* Subtle curved colored accent on right edge */}
              <div
                className="pointer-events-none absolute -right-2 top-1/2 h-16 w-3 -translate-y-1/2 rounded-l-full opacity-30"
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
              <div className="mt-5">
                <span className="text-[12px] font-bold text-muted">{card.label}</span>
                <div className="mt-1 text-2xl font-black tracking-tight text-[#141031]">
                  {card.value}
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-muted/80">
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
