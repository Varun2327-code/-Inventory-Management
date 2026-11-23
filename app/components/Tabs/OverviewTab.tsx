"use client";

import React, { useMemo, useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Package,
  AlertTriangle,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sliders,
  ArrowDownLeft,
  Activity,
  FileText,
  Truck,
  TrendingUp,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Boxes,
  MapPin,
  Building,
} from "lucide-react";
import { Item, Movement, Purchase, Sale, Tab } from "../../types";
import { money } from "../../lib/formatters";

interface OverviewTabProps {
  items: Item[];
  sales: Sale[];
  purchases: Purchase[];
  movements: Movement[];
  currency: string;
  onNavigate: (tab: Tab) => void;
  onOpenAddItem: () => void;
  onOpenCreateSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenAdjustStock: () => void;
  onSelectSale: (sale: Sale) => void;
  onSelectPurchase: (purchase: Purchase) => void;
}

export default function OverviewTab({
  items,
  sales,
  purchases,
  movements,
  currency,
  onNavigate,
  onOpenAddItem,
  onOpenCreateSale,
  onOpenNewPurchase,
  onOpenAdjustStock,
  onSelectSale,
  onSelectPurchase,
}: OverviewTabProps) {
  const [selectedChartPeriod, setSelectedChartPeriod] = useState<"7M" | "30D">("7M");
  const [recentTab, setRecentTab] = useState<"all" | "sales" | "purchases">("all");

  // Core metrics computations
  const totalStockCost = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.cost, 0),
    [items]
  );
  const totalStockRetail = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );
  const totalSalesRevenue = useMemo(
    () => sales.reduce((sum, s) => (s.status !== "Cancelled" ? sum + s.amount : sum), 0),
    [sales]
  );

  const costOfGoodsSold = useMemo(
    () =>
      sales.reduce((acc, s) => {
        if (s.status === "Cancelled") return acc;
        return acc + s.items.reduce((itemAcc, it) => itemAcc + it.qty * (it.unitCost || 0), 0);
      }, 0),
    [sales]
  );

  const grossProfit = Math.max(0, totalSalesRevenue - costOfGoodsSold);
  const profitMargin =
    totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(1) : "0";

  const totalUnitsOnHand = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const lowItems = useMemo(() => items.filter((i) => i.qty <= i.min), [items]);
  const outOfStockItems = useMemo(() => items.filter((i) => i.qty === 0), [items]);
  const healthyItemsCount = items.length - lowItems.length;
  const inStockRate = items.length > 0 ? ((healthyItemsCount / items.length) * 100).toFixed(0) : "100";

  // Top products by value
  const topProducts = useMemo(
    () => [...items].sort((a, b) => b.qty * b.cost - a.qty * a.cost).slice(0, 4),
    [items]
  );

  // Monthly sales simulation based on actual sales total
  const monthlyData = useMemo(() => {
    const base = totalSalesRevenue > 0 ? totalSalesRevenue / 5 : 1200;
    return [
      { month: "May", amount: Math.round(base * 0.48), pct: 44 },
      { month: "Jun", amount: Math.round(base * 0.62), pct: 56 },
      { month: "Jul", amount: Math.round(base * 0.54), pct: 50 },
      { month: "Aug", amount: Math.round(base * 0.78), pct: 72 },
      { month: "Sep", amount: Math.round(base * 0.69), pct: 64 },
      { month: "Oct", amount: Math.round(base * 0.88), pct: 84 },
      { month: "Nov", amount: Math.round(totalSalesRevenue), pct: 98, isCurrent: true },
    ];
  }, [totalSalesRevenue]);

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white via-[#fcfdfe] to-[#f4f8f5] p-6 sm:p-8 shadow-soft">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live System Active
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
                <Calendar size={13} /> {currentDateFormatted}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Operations & Inventory Control
            </h1>
            <p className="mt-1.5 text-[12px] text-muted leading-relaxed">
              Real-time monitoring across <strong className="text-ink">{items.length} products</strong>,{" "}
              <strong className="text-ink">{totalUnitsOnHand} warehouse units</strong>, and current billing fulfillment.
            </p>
          </div>

          {/* Quick Action Station */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddItem}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[11px] font-bold text-ink shadow-xs hover:bg-canvas hover:border-brand/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-50 text-brand">
                <Plus size={13} strokeWidth={2.5} />
              </div>
              <span>Add Product</span>
            </button>

            <button
              onClick={onOpenNewPurchase}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[11px] font-bold text-ink shadow-xs hover:bg-canvas hover:border-blue-400 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <ShoppingCart size={13} strokeWidth={2.2} />
              </div>
              <span>New Purchase</span>
            </button>

            <button
              onClick={onOpenAdjustStock}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[11px] font-bold text-ink shadow-xs hover:bg-canvas hover:border-amber-400 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <Sliders size={13} strokeWidth={2.2} />
              </div>
              <span>Adjust Stock</span>
            </button>

            {/* Premium Highlight CTA Button: Record Sale */}
            <button
              onClick={onOpenCreateSale}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#176147] px-4 py-2 text-[12px] font-bold text-white shadow-[0_2px_10px_rgba(22,101,74,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-emerald-700/20 hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_4px_16px_rgba(22,101,74,0.4)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white shadow-xs group-hover:scale-110 transition-transform">
                <ShoppingBag size={12} strokeWidth={2.5} />
              </div>
              <span>Record Sale</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[10px] text-white/90">
                <ArrowUpRight size={10} strokeWidth={3} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Global Inventory Health Strip */}
        <div className="mt-6 border-t border-line/80 pt-4 flex flex-wrap items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand" />
            <span className="font-semibold text-ink">Inventory Health Score:</span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
              {inStockRate}% Healthy
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand" />
              <span>{healthyItemsCount} Healthy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{lowItems.length} Low Stock</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>{outOfStockItems.length} Out of Stock</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Asset Value */}
        <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:shadow-md hover:border-brand/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">Total Inventory Valuation</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-brand ring-1 ring-emerald-200/50">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-ink">
            {money(totalStockCost, currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
            <span>Procurement cost basis</span>
            <span className="font-bold text-emerald-700">
              Retail: {money(totalStockRetail, currency)}
            </span>
          </div>
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-canvas overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${inStockRate}%` }}
            />
          </div>
        </div>

        {/* Card 2: Sales Revenue */}
        <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:shadow-md hover:border-brand/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">Total Sales Revenue</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-brand ring-1 ring-emerald-200/50">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-ink">
            {money(totalSalesRevenue, currency)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-muted">{sales.length} fulfilled invoices</span>
            <span className="font-bold text-brand">{profitMargin}% margin</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
            <span className="font-semibold text-ink">Gross Profit:</span>
            <span className="font-bold text-brand">+{money(grossProfit, currency)}</span>
          </div>
        </div>

        {/* Card 3: Active Catalog Items */}
        <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:shadow-md hover:border-blue-400">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">Products in Catalog</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200/50">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-ink">{items.length} SKUs</div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
            <span>Stored in warehouse</span>
            <span className="font-bold text-ink">{totalUnitsOnHand} units total</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
            <span className="rounded bg-canvas px-1.5 py-0.5 text-[9px] font-semibold text-ink">
              Electronics
            </span>
            <span className="rounded bg-canvas px-1.5 py-0.5 text-[9px] font-semibold text-ink">
              Office
            </span>
            <span className="rounded bg-canvas px-1.5 py-0.5 text-[9px] font-semibold text-ink">
              Accessories
            </span>
          </div>
        </div>

        {/* Card 4: Low Stock Alerts */}
        <div
          onClick={() => (lowItems.length > 0 ? onNavigate("Stock") : null)}
          className={`group relative overflow-hidden rounded-2xl border p-5 shadow-soft transition hover:shadow-md cursor-pointer ${
            lowItems.length > 0
              ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
              : "border-line bg-white hover:border-brand/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted">Reorder Alerts</span>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                lowItems.length > 0
                  ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300/60"
                  : "bg-emerald-50 text-brand ring-1 ring-emerald-200/50"
              }`}
            >
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-ink">
            {lowItems.length} items
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px]">
            <span className="text-amber-800 font-medium">
              {outOfStockItems.length} out of stock
            </span>
            {lowItems.length > 0 ? (
              <span className="font-bold text-amber-800 flex items-center gap-0.5 group-hover:underline">
                Reorder <ChevronRight size={12} />
              </span>
            ) : (
              <span className="font-bold text-brand">All stock healthy</span>
            )}
          </div>
          <div className="mt-3 text-[10px] text-muted truncate">
            {lowItems.length > 0
              ? lowItems.map((i) => i.name).slice(0, 2).join(", ") +
                (lowItems.length > 2 ? ` +${lowItems.length - 2} more` : "")
              : "No stock warnings"}
          </div>
        </div>
      </div>

      {/* Middle Section: Sales Velocity Chart & Low Stock Action Shelf */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        {/* Sales Performance Visualizer */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={17} className="text-brand" />
                  <h3 className="text-base font-bold text-ink">Sales Velocity & Inflows</h3>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  Monthly revenue trajectory across invoiced orders
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-brand border border-emerald-200">
                  +18.4% MoM
                </span>
                <button
                  onClick={() => onNavigate("Reports")}
                  className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
                >
                  Reports <ArrowUpRight size={13} />
                </button>
              </div>
            </div>

            {/* Simulated Bar Chart Visual */}
            <div className="mt-6 flex h-[210px] items-end gap-2.5 sm:gap-6 border-b border-line px-2 pb-2">
              {monthlyData.map((d) => (
                <div key={d.month} className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-ink text-white text-[10px] py-1 px-2 rounded-lg font-bold pointer-events-none whitespace-nowrap shadow-lg z-20">
                    {money(d.amount, currency)}
                  </div>
                  <div
                    className={`w-full max-w-[44px] rounded-t-xl transition-all duration-300 group-hover:opacity-90 ${
                      d.isCurrent
                        ? "bg-gradient-to-t from-brand to-[#2ba077] shadow-sm shadow-brand/30"
                        : "bg-[#dbe7e0] group-hover:bg-[#bcd6c5]"
                    }`}
                    style={{ height: `${d.pct}%` }}
                  />
                  <span
                    className={`text-[10px] font-semibold ${
                      d.isCurrent ? "text-brand font-bold" : "text-muted"
                    }`}
                  >
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-4 text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                <span>Current Month ({money(totalSalesRevenue, currency)})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbe7e0]" />
                <span>Historical Pace</span>
              </span>
            </div>
            <div className="text-muted">
              Average Order Size:{" "}
              <strong className="text-ink font-bold">
                {money(sales.length > 0 ? totalSalesRevenue / sales.length : 0, currency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Actionable Reorder Center / Low Stock Shelf */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={17} className="text-amber-600" />
                  <h3 className="text-base font-bold text-ink">Restock Planner</h3>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  Items requiring immediate procurement
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                {lowItems.length} alerts
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {lowItems.length === 0 ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-[12px] text-emerald-800 font-semibold">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-2" />
                  All products are well-stocked above reorder threshold!
                </div>
              ) : (
                lowItems.slice(0, 4).map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-canvas/40 p-3 hover:bg-canvas transition"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="font-bold text-[12px] text-ink truncate">{it.name}</div>
                      <div className="text-[10px] text-muted flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{it.sku}</span>
                        <span>·</span>
                        <span>Min: {it.min} units</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-[12px] font-black ${
                          it.qty === 0 ? "text-red-600" : "text-amber-700"
                        }`}
                      >
                        {it.qty === 0 ? "Out of Stock" : `${it.qty} left`}
                      </div>
                      <button
                        onClick={onOpenNewPurchase}
                        className="mt-1 rounded-md bg-white border border-line px-2 py-0.5 text-[9px] font-bold text-brand hover:border-brand transition shadow-xs"
                      >
                        + Reorder
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-3 flex items-center justify-between text-[11px]">
            <span className="text-muted">Total items needing action:</span>
            <button
              onClick={() => onNavigate("Stock")}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              Manage Catalog <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Value Concentration & Warehouse Asset Split */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Top 4 Valued Products */}
        <div className="xl:col-span-2 rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Boxes size={17} className="text-brand" />
                <h3 className="text-base font-bold text-ink">Highest Capital Concentration</h3>
              </div>
              <p className="text-[11px] text-muted mt-0.5">
                Top products holding the highest inventory asset value
              </p>
            </div>
            <button
              onClick={() => onNavigate("Stock")}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              Full inventory <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {topProducts.map((p) => {
              const val = p.qty * p.cost;
              const retailVal = p.qty * p.price;
              const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : 0;
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-line p-3.5 bg-canvas/30 hover:bg-canvas/60 transition shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted font-mono">
                        {p.sku} · {p.category}
                      </span>
                      <h4 className="font-bold text-[12px] text-ink truncate mt-0.5">{p.name}</h4>
                    </div>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5">
                      {margin}% margin
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <div>
                      <div className="text-[9px] text-muted">Stock Quantity</div>
                      <div className="font-bold text-ink">{p.qty} units</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-muted">Cost Value</div>
                      <div className="font-bold text-brand">{money(val, currency)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warehouse Storage & Quick Locations */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-line pb-4 mb-4">
              <MapPin size={17} className="text-brand" />
              <div>
                <h3 className="text-base font-bold text-ink">Warehouse Zones</h3>
                <p className="text-[11px] text-muted mt-0.5">Units stored across physical rooms</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line p-3 bg-canvas/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1">
                  <span>Main Warehouse (A & C Bins)</span>
                  <span className="text-brand">
                    {items
                      .filter((i) => i.location.toLowerCase().includes("main"))
                      .reduce((s, i) => s + i.qty, 0)}{" "}
                    units
                  </span>
                </div>
                <div className="text-[10px] text-muted">Primary distribution facility</div>
              </div>

              <div className="rounded-xl border border-line p-3 bg-canvas/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-ink mb-1">
                  <span>Store Room (B Shelves)</span>
                  <span className="text-brand">
                    {items
                      .filter((i) => i.location.toLowerCase().includes("store"))
                      .reduce((s, i) => s + i.qty, 0)}{" "}
                    units
                  </span>
                </div>
                <div className="text-[10px] text-muted">Office & accessories reserve</div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Quick Automation Rule:</span>
            Sales orders automatically deduct from designated storage bins upon generation.
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Sales & Live Movement Feed */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Sales Invoices */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-brand" />
                <h3 className="text-base font-bold text-ink">Recent Sales Activity</h3>
              </div>
              <p className="text-[11px] text-muted mt-0.5">Latest fulfilled customer invoices</p>
            </div>
            <button
              onClick={() => onNavigate("Sales")}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              All sales <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-line">
            {sales.slice(0, 4).map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSale(s)}
                className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-canvas/50 px-2 rounded-xl transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-brand ring-1 ring-emerald-200/50 shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-ink group-hover:text-brand transition">
                      {s.customer}
                    </div>
                    <div className="text-[10px] text-muted">
                      {s.id} · {s.date} · {s.items.length} product{s.items.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-black text-ink">{money(s.amount, currency)}</div>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      s.status === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : s.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Movements Audit Feed */}
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={17} className="text-brand" />
                <h3 className="text-base font-bold text-ink">Real-time Stock Movements</h3>
              </div>
              <p className="text-[11px] text-muted mt-0.5">Chronological inventory audit log</p>
            </div>
            <button
              onClick={() => onNavigate("Movements")}
              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              Audit journal <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-line">
            {movements.slice(0, 4).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3.5 px-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                      m.qtyDelta > 0
                        ? "bg-emerald-50 text-brand ring-1 ring-emerald-200/50"
                        : "bg-amber-50 text-amber-800 ring-1 ring-amber-200/50"
                    }`}
                  >
                    {m.qtyDelta > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold text-ink">{m.itemName}</div>
                    <div className="text-[10px] text-muted">
                      {m.reason} {m.reference ? `· ${m.reference}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[12px] font-black tabular-nums ${
                      m.qtyDelta > 0 ? "text-brand" : "text-amber-700"
                    }`}
                  >
                    {m.qtyDelta > 0 ? `+${m.qtyDelta}` : m.qtyDelta} units
                  </div>
                  <div className="text-[9px] text-muted">{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
