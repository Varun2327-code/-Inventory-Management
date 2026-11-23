"use client";

import React from "react";
import {
  Download,
  TrendingUp,
  Boxes,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  PieChart,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Item, Purchase, Sale } from "../../types";
import { money } from "../../lib/formatters";
import { exportItemsToCSV } from "../../lib/csv";

interface ReportsTabProps {
  items: Item[];
  sales: Sale[];
  purchases: Purchase[];
  currency: string;
  onNavigateToStock: () => void;
  onNavigateToPurchases: () => void;
}

export default function ReportsTab({
  items,
  sales,
  purchases,
  currency,
  onNavigateToStock,
  onNavigateToPurchases,
}: ReportsTabProps) {
  // Financial computations
  const totalSalesRevenue = sales.reduce(
    (s, x) => (x.status !== "Cancelled" ? s + x.amount : s),
    0
  );

  const costOfGoodsSold = sales.reduce((acc, s) => {
    if (s.status === "Cancelled") return acc;
    return acc + s.items.reduce((itemAcc, it) => itemAcc + it.qty * (it.unitCost || 0), 0);
  }, 0);

  const grossProfit = Math.max(0, totalSalesRevenue - costOfGoodsSold);
  const profitMarginPct =
    totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : "0";

  // Inventory Asset computations
  const totalStockCost = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const totalStockRetail = items.reduce((s, i) => s + i.qty * i.price, 0);
  const potentialProfit = Math.max(0, totalStockRetail - totalStockCost);

  // Category breakdown
  const categoryMap = new Map<string, { count: number; value: number }>();
  for (const item of items) {
    const prev = categoryMap.get(item.category) || { count: 0, value: 0 };
    categoryMap.set(item.category, {
      count: prev.count + item.qty,
      value: prev.value + item.qty * item.cost,
    });
  }
  const categoryStats = Array.from(categoryMap.entries()).map(([cat, data]) => ({
    category: cat,
    units: data.count,
    costValue: data.value,
    sharePct: totalStockCost > 0 ? ((data.value / totalStockCost) * 100).toFixed(1) : "0",
  }));

  // Top products by value
  const topValuedItems = [...items].sort((a, b) => b.qty * b.cost - a.qty * a.cost).slice(0, 5);

  // Low stock reorder list
  const lowItems = items.filter((i) => i.qty <= i.min);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">
            BUSINESS INTELLIGENCE & ANALYTICS
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Financial & Inventory Reports</h1>
          <p className="mt-1 text-[12px] text-muted">
            Real-time analytics for revenue, Cost of Goods Sold (COGS), gross margins, and inventory valuation.
          </p>
        </div>

        <button
          onClick={() => exportItemsToCSV(items)}
          className="flex items-center gap-1.5 rounded-2xl border border-line bg-white px-4 py-2.5 text-[12px] font-bold text-ink shadow-soft hover:bg-canvas hover:border-brand/40 transition"
        >
          <Download size={14} /> Export Full Inventory Data
        </button>
      </div>

      {/* Top 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Total Sales Revenue</div>
          <div className="mt-1 text-2xl font-bold text-ink">
            {money(totalSalesRevenue, currency)}
          </div>
          <div className="text-[10px] text-muted">Invoiced volume</div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Cost of Goods Sold (COGS)</div>
          <div className="mt-1 text-2xl font-bold text-muted">
            {money(costOfGoodsSold, currency)}
          </div>
          <div className="text-[10px] text-muted">Direct product costs</div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Gross Profit</div>
          <div className="mt-1 text-2xl font-bold text-brand">
            {money(grossProfit, currency)}
          </div>
          <div className="text-[10px] text-brand font-semibold">{profitMarginPct}% profit margin</div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Stock Asset Valuation</div>
          <div className="mt-1 text-2xl font-bold text-ink">
            {money(totalStockCost, currency)}
          </div>
          <div className="text-[10px] text-muted">
            Retail potential: {money(totalStockRetail, currency)}
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Category Breakdown */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-ink">Category Asset Distribution</h3>
            <p className="text-[11px] text-muted">Share of capital invested by department</p>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-semibold text-ink">{cat.category}</span>
                  <span className="text-muted">
                    {cat.units} units · {money(cat.costValue, currency)} ({cat.sharePct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-canvas overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-300"
                    style={{ width: `${cat.sharePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-line bg-canvas/40 p-3 flex justify-between text-[11px]">
            <span className="text-muted">Unrealized Potential Profit:</span>
            <span className="font-bold text-brand">{money(potentialProfit, currency)}</span>
          </div>
        </div>

        {/* Top Valued Inventory Items */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink">Top Products by Inventory Value</h3>
              <p className="text-[11px] text-muted">Highest capital concentration</p>
            </div>
            <button
              onClick={onNavigateToStock}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              View catalog <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-line">
            {topValuedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[12px] font-semibold text-ink">{item.name}</div>
                  <div className="text-[10px] text-muted font-mono">
                    {item.sku} · {item.qty} units @ {money(item.cost, currency)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-ink">
                    {money(item.qty * item.cost, currency)}
                  </div>
                  <div className="text-[9px] text-muted">
                    Retail: {money(item.qty * item.price, currency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Reorder Planner */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-600" />
              <h3 className="text-sm font-bold text-ink">Restock & Reorder Action Plan</h3>
            </div>
            <p className="text-[11px] text-muted mt-0.5">
              Items currently at or below their reorder threshold level.
            </p>
          </div>
          {lowItems.length > 0 && (
            <button
              onClick={onNavigateToPurchases}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-[11px] font-bold text-white hover:bg-[#185940] transition"
            >
              <ShoppingCart size={14} /> Create Purchase Order
            </button>
          )}
        </div>

        {lowItems.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-[12px] text-emerald-800 font-semibold">
            All inventory levels are healthy! No items need reordering right now.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
                <tr>
                  <th className="px-3.5 py-2.5">Item Name</th>
                  <th className="px-3 py-2.5">SKU</th>
                  <th className="px-3 py-2.5 text-center">Current Qty</th>
                  <th className="px-3 py-2.5 text-center">Min Threshold</th>
                  <th className="px-3 py-2.5 text-center">Suggested Reorder</th>
                  <th className="px-3.5 py-2.5">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lowItems.map((item) => {
                  const suggestedReorder = Math.max(10, item.min * 2 - item.qty);
                  return (
                    <tr key={item.id} className="hover:bg-canvas/30">
                      <td className="px-3.5 py-2.5 font-semibold text-ink">{item.name}</td>
                      <td className="px-3 py-2.5 font-mono text-muted">{item.sku}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-red-600">
                        {item.qty} units
                      </td>
                      <td className="px-3 py-2.5 text-center text-muted">{item.min} units</td>
                      <td className="px-3 py-2.5 text-center font-bold text-brand">
                        +{suggestedReorder} units
                      </td>
                      <td className="px-3.5 py-2.5 text-muted">{item.supplier || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
