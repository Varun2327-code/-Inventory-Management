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
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Sale } from "../../types";
import { money } from "../../lib/formatters";
import { exportSalesToCSV } from "../../lib/csv";

interface SalesTabProps {
  sales: Sale[];
  currency: string;
  onCreateSale: () => void;
  onViewSale: (sale: Sale) => void;
  onMarkPaid: (saleId: string) => void;
  onDeleteSale: (sale: Sale) => void;
}

export default function SalesTab({
  sales,
  currency,
  onCreateSale,
  onViewSale,
  onMarkPaid,
  onDeleteSale,
}: SalesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const totalSales = sales.reduce((s, x) => (x.status !== "Cancelled" ? s + x.amount : s), 0);
  const paidSales = sales.filter((s) => s.status === "Paid");
  const pendingSales = sales.filter((s) => s.status === "Pending");
  const overdueSales = sales.filter((s) => s.status === "Overdue");

  const paidAmount = paidSales.reduce((s, x) => s + x.amount, 0);
  const pendingAmount = pendingSales.reduce((s, x) => s + x.amount, 0);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        (s.customerEmail && s.customerEmail.toLowerCase().includes(q)) ||
        s.items.some((it) => it.itemName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sales, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">
            ORDER FULFILLMENT & REVENUE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Sales & Invoices</h1>
          <p className="mt-1 text-[12px] text-muted">
            Manage customer orders, track payments, generate commercial invoices, and check stock deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSalesToCSV(sales)}
            className="flex items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-2.5 text-[12px] font-bold text-ink shadow-soft hover:bg-canvas hover:border-brand/40 transition"
          >
            <Download size={14} /> Export Invoices CSV
          </button>
          <button
            onClick={onCreateSale}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#4f46e5] px-4.5 py-2.5 text-[12px] font-bold text-white shadow-purple hover:shadow-[0_20px_45px_-5px_rgba(99,102,241,0.5)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={15} /> Create Sale Invoice
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Total Sales Revenue</div>
          <div className="mt-1 text-2xl font-bold text-ink">{money(totalSales, currency)}</div>
          <div className="text-[10px] text-muted">{sales.length} total invoices issued</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Paid Revenue</div>
          <div className="mt-1 text-2xl font-bold text-brand">{money(paidAmount, currency)}</div>
          <div className="text-[10px] text-muted">{paidSales.length} settled orders</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Awaiting Payment</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {money(pendingAmount, currency)}
          </div>
          <div className="text-[10px] text-muted">{pendingSales.length} open invoices</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Overdue Invoices</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{overdueSales.length}</div>
          <div className="text-[10px] text-muted">Requires follow-up</div>
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
            placeholder="Search by invoice #, customer name, email, or item..."
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
            <option value="All">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-[12px]">
            <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Line Items</th>
                <th className="px-4 py-3.5 text-right">Amount</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredSales.map((sale) => {
                const statusColor =
                  sale.status === "Paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : sale.status === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : sale.status === "Overdue"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700";

                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-canvas/40 transition group cursor-default"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-brand">
                      <span
                        onClick={() => onViewSale(sale)}
                        className="cursor-pointer hover:underline"
                      >
                        {sale.id}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink">{sale.customer}</div>
                      {sale.customerEmail && (
                        <div className="text-[10px] text-muted">{sale.customerEmail}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-muted">{sale.date}</td>

                    <td className="px-4 py-3.5 text-muted">
                      {sale.items.length > 0 ? (
                        <div>
                          <span className="font-medium text-ink">
                            {sale.items[0].itemName} (x{sale.items[0].qty})
                          </span>
                          {sale.items.length > 1 && (
                            <span className="text-[10px] text-muted ml-1">
                              +{sale.items.length - 1} more
                            </span>
                          )}
                        </div>
                      ) : (
                        "0 items"
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-ink tabular-nums">
                      {money(sale.amount, currency)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}
                      >
                        {sale.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewSale(sale)}
                          title="View / Print Invoice"
                          className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
                        >
                          <Eye size={15} />
                        </button>
                        {sale.status !== "Paid" && (
                          <button
                            onClick={() => onMarkPaid(sale.id)}
                            title="Mark as Paid"
                            className="rounded-lg p-1.5 text-muted hover:bg-emerald-50 hover:text-emerald-700 transition"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteSale(sale)}
                          title="Cancel / Delete Sale"
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

          {filteredSales.length === 0 && (
            <div className="p-12 text-center">
              <FileText size={32} className="mx-auto text-muted mb-2 opacity-50" />
              <div className="text-[13px] font-semibold text-ink">No invoices found</div>
              <p className="text-[11px] text-muted mt-1">
                Create a new sale invoice to record orders and deduct stock automatically.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] text-muted">
          <span>
            Showing <strong>{filteredSales.length}</strong> of <strong>{sales.length}</strong> sales
          </span>
          <span>Click any invoice to view line items, print receipt, or update status</span>
        </div>
      </div>
    </div>
  );
}
