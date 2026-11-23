"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  Search,
  Sliders,
  FileText,
  Truck,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Movement } from "../../types";
import { exportMovementsToCSV } from "../../lib/csv";

interface MovementsTabProps {
  movements: Movement[];
  onClearMovements?: () => void;
}

export default function MovementsTab({ movements }: MovementsTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.itemName.toLowerCase().includes(q) ||
        (m.sku && m.sku.toLowerCase().includes(q)) ||
        m.reason.toLowerCase().includes(q) ||
        (m.reference && m.reference.toLowerCase().includes(q));

      const matchesType = typeFilter === "All" || m.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">
            AUDIT TRAIL & TRACEABILITY
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Stock Movement Log</h1>
          <p className="mt-1 text-[12px] text-muted">
            Immutable chronological transaction journal tracking every stock addition, deduction, sale fulfillment, and recount.
          </p>
        </div>

        <button
          onClick={() => exportMovementsToCSV(movements)}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[11px] font-semibold text-ink shadow-xs hover:bg-canvas transition"
        >
          <Download size={14} /> Export Audit Log CSV
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-white p-3 shadow-soft">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-line bg-canvas/40 px-3 py-2">
          <Search size={15} className="text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, invoice #, or note..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[11px]">
          <Filter size={13} className="text-muted" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent outline-none font-medium text-ink text-[11px]"
          >
            <option value="All">All Operations</option>
            <option value="sale">Sales Fulfillments</option>
            <option value="purchase">Purchase Receipts</option>
            <option value="adjustment">Manual Adjustments</option>
            <option value="created">New Items</option>
            <option value="deleted">Deletions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-[12px]">
            <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5 text-center">Qty Change</th>
                <th className="px-4 py-3.5">Reason & Description</th>
                <th className="px-5 py-3.5 text-right">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((m) => {
                const isPositive = m.qtyDelta > 0;
                return (
                  <tr key={m.id} className="hover:bg-canvas/40 transition">
                    <td className="px-5 py-3.5 text-[11px] text-muted whitespace-nowrap">
                      {m.date}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink">{m.itemName}</div>
                      {m.sku && <div className="font-mono text-[9px] text-muted">{m.sku}</div>}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          m.type === "sale"
                            ? "bg-amber-100 text-amber-800"
                            : m.type === "purchase"
                            ? "bg-emerald-100 text-emerald-800"
                            : m.type === "adjustment"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold tabular-nums text-[12px] ${
                          isPositive ? "text-brand" : "text-amber-700"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft size={13} />
                        ) : (
                          <ArrowUpRight size={13} />
                        )}
                        {isPositive ? `+${m.qtyDelta}` : m.qtyDelta}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-muted">{m.reason}</td>

                    <td className="px-5 py-3.5 text-right font-mono text-[11px] text-muted">
                      {m.reference || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Activity size={32} className="mx-auto text-muted mb-2 opacity-50" />
              <div className="text-[13px] font-semibold text-ink">No movements recorded</div>
              <p className="text-[11px] text-muted mt-1">
                Any sales, purchases, or manual stock changes will appear here automatically.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] text-muted">
          <span>
            Total recorded entries: <strong>{movements.length}</strong>
          </span>
          <span>Automatic audit trail generated on every inventory state change</span>
        </div>
      </div>
    </div>
  );
}
