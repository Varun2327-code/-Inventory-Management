"use client";

import React from "react";
import { AlertTriangle, ShoppingCart, CheckCircle2, ArrowUpRight, Sliders } from "lucide-react";
import { Item } from "../../types";

interface LowStockAlertsProps {
  lowItems: Item[];
  onOrderStock: (item: Item) => void;
  onAdjustStock: (item: Item) => void;
}

export default function LowStockAlerts({
  lowItems,
  onOrderStock,
  onAdjustStock,
}: LowStockAlertsProps) {
  if (lowItems.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5 text-emerald-900 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-[13px] text-emerald-950">
              Inventory Health Optimal
            </h4>
            <p className="text-[11px] font-medium text-emerald-700">
              All items in the catalog are stocked safely above reorder thresholds.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800">
          0 Alerts
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-rose-200/80 bg-gradient-to-r from-rose-50/80 via-white to-white p-5 sm:p-6 shadow-[0_12px_32px_rgba(244,63,94,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-xs">
            <AlertTriangle size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-[#141031] flex items-center gap-2">
              Low Stock Reorder Alerts
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                {lowItems.length} Critical
              </span>
            </h3>
            <p className="text-[11px] font-semibold text-muted">
              Stock has dropped below safe buffer levels. Procure units to avoid stockouts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {lowItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-rose-100 bg-white p-4 shadow-xs transition hover:border-rose-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/50">
                  {item.sku}
                </span>
                <span className="text-[10px] font-bold text-muted">{item.location}</span>
              </div>
              <h4 className="mt-2 text-[13px] font-extrabold text-[#141031] line-clamp-1">
                {item.name}
              </h4>
              <div className="mt-1 flex items-baseline gap-1 text-[12px]">
                <span className="font-black text-rose-600 text-base">{item.qty} units left</span>
                <span className="text-muted text-[11px] font-semibold">/ min {item.min}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 pt-2 border-t border-[#f4f6fc]">
              <button
                onClick={() => onOrderStock(item)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6835f1] py-1.5 px-3 text-[11px] font-bold text-white shadow-xs hover:bg-[#5828d9] transition"
              >
                <ShoppingCart size={13} /> Reorder PO
              </button>
              <button
                onClick={() => onAdjustStock(item)}
                title="Adjust Stock"
                className="rounded-xl border border-line bg-white p-1.5 text-muted hover:bg-canvas hover:text-[#141031] transition"
              >
                <Sliders size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
