"use client";

import React from "react";
import { ArrowUpRight, CheckCircle2, MoreHorizontal } from "lucide-react";

interface TransactionRow {
  id: string;
  name: string;
  time: string;
  amount: string;
  type: string;
  balance: string;
  status: "Completed" | "Pending" | "In Review";
  avatarUrl: string;
}

const TRANSACTIONS: TransactionRow[] = [
  {
    id: "tx-1",
    name: "Laon",
    time: "12:42:00 PM",
    amount: "$1200.00",
    type: "Installments",
    balance: "$5,420.00",
    status: "Completed",
    // Asian portrait avatar matching the user's reference image
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "tx-2",
    name: "Morrow Studio",
    time: "10:15:30 AM",
    amount: "$4,850.00",
    type: "Direct Deposit",
    balance: "$12,890.00",
    status: "Completed",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "tx-3",
    name: "Aster Labs",
    time: "09:05:12 AM",
    amount: "$890.50",
    type: "Wire Settlement",
    balance: "$18,240.00",
    status: "Completed",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  },
];

export default function HistorySection() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tight text-[#141031]">History</h2>
        <button className="text-[12px] font-bold text-[#6835f1] hover:underline flex items-center gap-1">
          View all transactions <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#e8ebf7] bg-white p-4 sm:p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#f0f2fa] text-[11px] font-bold uppercase tracking-wider text-muted/70">
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Type</th>
                <th className="pb-3 px-3">Amount</th>
                <th className="pb-3 px-3">Balance</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6fc]">
              {TRANSACTIONS.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition duration-150 hover:bg-[#f8f9fe] group cursor-pointer"
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
                    {tx.type}
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-3 font-black text-[#141031]">
                    {tx.amount}
                  </td>

                  {/* Balance */}
                  <td className="py-3.5 px-3 font-semibold text-muted">
                    {tx.balance}
                  </td>

                  {/* Status: Green pill Completed */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-black text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {tx.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right">
                    <button className="rounded-lg p-1 text-muted hover:bg-canvas hover:text-[#141031] transition">
                      <MoreHorizontal size={16} />
                    </button>
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
