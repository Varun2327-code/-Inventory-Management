"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Trash2,
  Truck,
  Package,
} from "lucide-react";
import { Purchase } from "../../types";
import { money } from "../../lib/formatters";
import { exportPurchasesToCSV } from "../../lib/csv";

interface PurchasesTabProps {
  purchases: Purchase[];
  currency: string;
  onNewPurchase: () => void;
  onViewPurchase: (purchase: Purchase) => void;
  onMarkReceived: (purchase: Purchase) => void;
  onDeletePurchase: (purchase: Purchase) => void;
}

export default function PurchasesTab({
  purchases,
  currency,
  onNewPurchase,
  onViewPurchase,
  onMarkReceived,
  onDeletePurchase,
}: PurchasesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const totalPoValue = purchases.reduce((s, p) => (p.status !== "Cancelled" ? s + p.amount : s), 0);
  const receivedPos = purchases.filter((p) => p.status === "Received");
  const pendingPos = purchases.filter((p) => p.status === "Pending");

  const pendingValue = pendingPos.reduce((s, p) => s + p.amount, 0);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.items.some((it) => it.itemName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchases, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">
            SUPPLY CHAIN & PROCUREMENT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Purchase Orders</h1>
          <p className="mt-1 text-[12px] text-muted">
            Manage vendor shipments and restocking. Marking a PO as &quot;Received&quot; automatically adds stock
            to your catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPurchasesToCSV(purchases)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[11px] font-semibold text-ink shadow-xs hover:bg-canvas transition"
          >
            <Download size={14} /> Export POs CSV
          </button>
          <button
            onClick={onNewPurchase}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm hover:bg-[#185940] transition"
          >
            <Plus size={15} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Total Purchase Orders</div>
          <div className="mt-1 text-2xl font-bold text-ink">{purchases.length} orders</div>
          <div className="text-[10px] text-muted">{money(totalPoValue, currency)} total expenditure</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Received & Stocked</div>
          <div className="mt-1 text-2xl font-bold text-brand">{receivedPos.length} orders</div>
          <div className="text-[10px] text-muted">Units physically added to warehouse</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Pending Vendor Delivery</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {money(pendingValue, currency)}
          </div>
          <div className="text-[10px] text-muted">{pendingPos.length} shipments awaiting check-in</div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-white p-3 shadow-soft">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-line bg-canvas/40 px-3 py-2">
          <Search size={15} className="text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PO #, supplier name, or product..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[11px]">
          <Filter size={13} className="text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none font-medium text-ink text-[11px]"
          >
            <option value="All">All Statuses</option>
            <option value="Received">Received Only</option>
            <option value="Pending">Pending Delivery</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-[12px]">
            <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-5 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5">Items Summary</th>
                <th className="px-4 py-3.5 text-right">Order Value</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredPurchases.map((purchase) => {
                const isReceived = purchase.status === "Received";

                return (
                  <tr
                    key={purchase.id}
                    className="hover:bg-canvas/40 transition group cursor-default"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-brand">
                      <span
                        onClick={() => onViewPurchase(purchase)}
                        className="cursor-pointer hover:underline"
                      >
                        {purchase.id}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-ink">{purchase.supplier}</td>

                    <td className="px-4 py-3.5 text-muted">{purchase.date}</td>

                    <td className="px-4 py-3.5 text-muted">
                      {purchase.items.length > 0 ? (
                        <div>
                          <span className="font-medium text-ink">
                            {purchase.items[0].itemName} (x{purchase.items[0].qty})
                          </span>
                          {purchase.items.length > 1 && (
                            <span className="text-[10px] text-muted ml-1">
                              +{purchase.items.length - 1} more
                            </span>
                          )}
                        </div>
                      ) : (
                        "0 items"
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-ink tabular-nums">
                      {money(purchase.amount, currency)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isReceived
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isReceived && (
                          <button
                            onClick={() => onMarkReceived(purchase)}
                            className="rounded-lg bg-emerald-50 border border-emerald-300 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
                          >
                            Mark Received
                          </button>
                        )}
                        <button
                          onClick={() => onViewPurchase(purchase)}
                          title="View PO Details"
                          className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onDeletePurchase(purchase)}
                          title="Delete PO"
                          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPurchases.length === 0 && (
            <div className="p-12 text-center">
              <Truck size={32} className="mx-auto text-muted mb-2 opacity-50" />
              <div className="text-[13px] font-semibold text-ink">No purchase orders found</div>
              <p className="text-[11px] text-muted mt-1">
                Create a purchase order to record inbound supplier stock.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] text-muted">
          <span>
            Showing <strong>{filteredPurchases.length}</strong> of <strong>{purchases.length}</strong> orders
          </span>
          <span>Marking an order received immediately restocks the exact products</span>
        </div>
      </div>
    </div>
  );
}
