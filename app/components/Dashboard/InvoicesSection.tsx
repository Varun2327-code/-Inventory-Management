"use client";

import React from "react";
import { Wallet, Activity } from "lucide-react";
import SpeedometerCard from "./SpeedometerCard";
import InvoiceBarChart from "./InvoiceBarChart";
import MiniProgressCircle from "./MiniProgressCircle";

export default function InvoicesSection() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-black tracking-tight text-[#141031]">Invoices</h2>

      {/* 4-column balanced grid: 
          Col 1 (1 col): Amount Owed purple card (perfect portrait aspect ratio)
          Col 2 (1 col): Two stacked statistic cards ("Paid Invoices" + "Live Jobs Value")
          Col 3-4 (2 cols): Invoice Analytics Bar Chart
      */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 items-stretch">
        {/* Left: Amount Owed Card (1 col) */}
        <div className="lg:col-span-1 flex flex-col">
          <SpeedometerCard
            percentage={45}
            amountOwed="$933,879.45"
            secondaryAmount="$126,783.89"
          />
        </div>

        {/* Middle: Two Stacked Statistic Cards (1 col) */}
        <div className="lg:col-span-1 flex flex-col gap-5 justify-between">
          {/* Card 1: Paid Invoices */}
          <div className="flex-1 min-h-[170px] flex flex-col justify-between rounded-[28px] border border-[#e8ebf7] bg-gradient-to-br from-white to-[#fafbff] p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(95,45,235,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#edeef6] bg-[#f4f6fe] text-[#141031]">
                <Wallet size={19} strokeWidth={1.9} />
              </div>
              <MiniProgressCircle value={5} displayLabel="+5%" color="#10b981" />
            </div>

            <div className="mt-4 flex flex-col">
              <span className="text-[12px] font-bold text-muted">Paid Invoices</span>
              <div className="mt-1 text-[26px] font-black tracking-tight text-[#141031] leading-none">
                $9,034,.49
              </div>
              <p className="mt-2 text-[11px] font-semibold text-muted/80 leading-normal">
                Current Financial Year
              </p>
            </div>
          </div>

          {/* Card 2: Live Jobs Value (Progress circle correctly on top-right) */}
          <div className="flex-1 min-h-[170px] flex flex-col justify-between rounded-[28px] border border-[#e8ebf7] bg-gradient-to-br from-white to-[#fafbff] p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(95,45,235,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#edeef6] bg-[#f4f6fe] text-[#141031]">
                <Activity size={19} strokeWidth={1.9} />
              </div>
              <MiniProgressCircle value={85} displayLabel="85%" color="#6835f1" />
            </div>

            <div className="mt-4 flex flex-col">
              <span className="text-[12px] font-bold text-muted">Live Jobs Value</span>
              <div className="mt-1 text-[26px] font-black tracking-tight text-[#141031] leading-none">
                $23,7,8.32
              </div>
              <p className="mt-2 text-[11px] font-semibold text-muted/80 leading-normal">
                Current Financial Year
              </p>
            </div>
          </div>
        </div>

        {/* Right: Invoice Analytics Bar Chart (2 cols) */}
        <div className="lg:col-span-2 flex flex-col">
          <InvoiceBarChart />
        </div>
      </div>
    </div>
  );
}
