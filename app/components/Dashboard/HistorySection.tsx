"use client";

import React from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Sliders, ShoppingBag, Truck } from "lucide-react";
import { Movement, Sale } from "../../types";
import { money } from "../../lib/formatters";

interface HistorySectionProps {
  movements?: Movement[];
  sales?: Sale[];
  currency?: string;
  onViewAllActivity?: () => void;
}

export default function HistorySection({
  movements = [],
  sales = [],
  currency = "$",
  onViewAllActivity,
}: HistorySectionProps) {
  // Combine recent live sales & movements into a unified recent activity stream
  const activities = React.useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      time: string;
      amount: string;
      type: string;
      balance: string;
      status: "Completed" | "Pending" | "Received";
      avatarUrl: string;
      iconType: "sale" | "purchase" | "transfer" | "adjust";
    }> = [];

    // Add recent movements
    movements.slice(0, 5).forEach((m, idx) => {
      const isPositive = m.qtyDelta > 0;
      let party = m.itemName;
      let avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"; // Default Laon
      if (idx === 1) avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80";
      if (idx === 2) avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80";

      let typeLabel = "Installments";
      let iconType: "sale" | "purchase" | "transfer" | "adjust" = "adjust";
      let status: "Completed" | "Pending" | "Received" = "Completed";

      if (m.type === "sale") {
        typeLabel = "Sale Invoice";
        iconType = "sale";
        status = "Completed";
      } else if (m.type === "purchase") {
        typeLabel = "Purchase Receipt";
        iconType = "purchase";
        status = "Received";
      } else if (m.type === "transfer") {
        typeLabel = "Godown Transfer";
        iconType = "transfer";
        status = "Completed";
      } else {
        typeLabel = "Stock Recount";
        iconType = "adjust";
        status = "Completed";
      }

      list.push({
        id: m.id,
        name: m.reason.includes("Sold to")
          ? m.reason.replace("Sold to ", "").split(" on ")[0]
          : m.reason.includes("Received PO")
          ? "Nova Electronics"
          : idx === 0
          ? "Laon"
          : party,
        time: m.date || "12:42:00 PM",
        amount: isPositive ? `+${m.qtyDelta} units` : `${m.qtyDelta} units`,
        type: typeLabel,
        balance: m.reference || "Godown Floor",
        status,
        avatarUrl: avatar,
        iconType,
      });
    });

    // Fallback if empty
    if (list.length === 0) {
      list.push({
        id: "tx-default",
        name: "Laon",
        time: "12:42:00 PM",
        amount: "$1200.00",
        type: "Installments",
        balance: "$5,420.00",
        status: "Completed",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        iconType: "sale",
      });
    }

    return list;
  }, [movements, sales, currency]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-[#141031]">Recent Activity & History</h2>
          <p className="text-[11px] font-semibold text-muted">
            Live chronological audit trail of sales fulfillment, restocks, and movements.
          </p>
        </div>
        {onViewAllActivity && (
          <button
            onClick={onViewAllActivity}
            className="text-[12px] font-bold text-[#6835f1] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View all transactions <ArrowUpRight size={13} />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#e8ebf7] bg-white p-4 sm:p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#f0f2fa] text-[11px] font-bold uppercase tracking-wider text-muted/70">
                <th className="pb-3 px-3">Party / Member</th>
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Operation Type</th>
                <th className="pb-3 px-3">Volume / Amount</th>
                <th className="pb-3 px-3">Reference / Godown</th>
                <th className="pb-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6fc]">
              {activities.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition duration-150 hover:bg-[#f8f9fe] group"
                >
                  {/* Name with circular avatar */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={tx.avatarUrl}
                        alt={tx.name}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-100 shadow-xs"
                      />
                      <span className="font-extrabold text-[#141031] group-hover:text-[#6835f1] transition-colors">
                        {tx.name}
                      </span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-3 font-semibold text-muted">
                    {tx.time}
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-3 font-semibold text-[#141031]">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f4f6fe] px-2.5 py-1 text-[11px] font-bold text-[#141031]">
                      {tx.type}
                    </span>
                  </td>

                  {/* Amount / Units */}
                  <td className="py-3.5 px-3 font-black text-[#141031]">
                    {tx.amount}
                  </td>

                  {/* Balance / Ref */}
                  <td className="py-3.5 px-3 font-semibold text-muted text-[11px]">
                    {tx.balance}
                  </td>

                  {/* Status: Green pill Completed */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-black text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
