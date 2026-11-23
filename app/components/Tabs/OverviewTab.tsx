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
  RotateCcw,
  MoreVertical,
  Calendar,
  Layers,
  ChevronDown,
  CheckCircle2,
  Clock,
  Boxes,
  Target,
  Sparkles,
  CreditCard,
  Building,
} from "lucide-react";
import { Item, Movement, Purchase, Sale, Tab } from "../../types";
import { money } from "../../lib/formatters";
import { CircularMiniGauge, SpeedometerGauge } from "../UI/Gauges";

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
  const [historyFilter, setHistoryFilter] = useState<"all" | "sales" | "purchases">("all");

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
  const totalUnitsOnHand = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const lowItems = useMemo(() => items.filter((i) => i.qty <= i.min), [items]);
  const outOfStockItems = useMemo(() => items.filter((i) => i.qty === 0), [items]);
  const healthyItemsCount = items.length - lowItems.length;

  const pendingPurchasesCount = purchases.filter((p) => p.status === "Pending").length;
  const paidSales = sales.filter((s) => s.status === "Paid");
  const paidAmount = paidSales.reduce((sum, s) => sum + s.amount, 0);

  // Health / Fulfillment Score (e.g. 45% like the reference image)
  const healthPercentage = useMemo(() => {
    if (items.length === 0) return 0;
    const ratio = Math.round((healthyItemsCount / items.length) * 100);
    return Math.min(95, Math.max(35, ratio));
  }, [items, healthyItemsCount]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Row matching the reference screenshot */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
              Dashboard
            </h1>
            <button
              onClick={() => window.location.reload()}
              title="Refresh Dashboard"
              className="rounded-full p-1.5 text-muted hover:bg-white hover:text-brand transition shadow-xs"
            >
              <RotateCcw size={16} strokeWidth={2.2} />
            </button>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold text-muted">
            <span>Financial & Inventory Control</span>
            <ChevronDown size={14} className="text-muted/80" />
          </div>
        </div>

        {/* Action Station */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddItem}
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-[12px] font-bold text-ink shadow-soft hover:bg-canvas hover:border-brand/40 active:scale-[0.98] transition cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-50 text-brand">
              <Plus size={13} strokeWidth={2.5} />
            </div>
            <span>Add Item</span>
          </button>

          <button
            onClick={onOpenNewPurchase}
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-[12px] font-bold text-ink shadow-soft hover:bg-canvas hover:border-indigo-400 active:scale-[0.98] transition cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingCart size={13} strokeWidth={2.2} />
            </div>
            <span>New Purchase</span>
          </button>

          <button
            onClick={onOpenAdjustStock}
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-[12px] font-bold text-ink shadow-soft hover:bg-canvas hover:border-amber-400 active:scale-[0.98] transition cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Sliders size={13} strokeWidth={2.2} />
            </div>
            <span>Adjust Stock</span>
          </button>

          <button
            onClick={onOpenCreateSale}
            className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#4f46e5] px-5 py-2.5 text-[12px] font-bold text-white shadow-purple hover:shadow-[0_20px_45px_-5px_rgba(99,102,241,0.5)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white shadow-xs group-hover:scale-110 transition-transform">
              <ShoppingBag size={12} strokeWidth={2.5} />
            </div>
            <span>Record Sale</span>
            <ArrowUpRight size={13} className="text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* SECTION 1: "Bills" / Stock Operations Row (matching screenshot's 3-card layout) */}
      <div>
        <h2 className="text-lg font-black tracking-tight text-[#0f172a] mb-4">Bills & Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Ready to assign */}
          <div className="rounded-[28px] border border-line/70 bg-white p-6 shadow-soft hover:shadow-card transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-[#f8f9fe] text-[#0f172a]">
                <Calendar size={18} strokeWidth={1.8} />
              </div>
              <CircularMiniGauge value={42} label="+42%" color="#6366f1" />
            </div>

            <div className="mt-5">
              <span className="text-[12px] font-semibold text-muted">Ready to fulfill</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
                {totalUnitsOnHand} <span className="text-muted/60 font-medium">− {lowItems.length * 10}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted font-medium">
                Warehouse units in circulation this week
              </p>
            </div>
          </div>

          {/* Card 2: Pending sign offs */}
          <div className="rounded-[28px] border border-line/70 bg-white p-6 shadow-soft hover:shadow-card transition duration-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-[#f8f9fe] text-[#0f172a]">
                <FileText size={18} strokeWidth={1.8} />
              </div>
              <CircularMiniGauge value={22} label="+22%" color="#7c3aed" />
            </div>

            <div className="mt-5">
              <span className="text-[12px] font-semibold text-muted">Pending sign offs & POs</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
                {purchases.length} <span className="text-muted/60 font-medium">− {pendingPurchasesCount}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-muted font-medium">
                {pendingPurchasesCount} supplier shipments awaiting arrival
              </p>
            </div>
          </div>

          {/* Card 3: Declined / Reorder alerts */}
          <div
            onClick={() => onNavigate("Stock")}
            className="rounded-[28px] border border-line/70 bg-white p-6 shadow-soft hover:shadow-card transition duration-200 flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-[#fff5f5] text-rose-500">
                <AlertTriangle size={18} strokeWidth={1.8} />
              </div>
              <CircularMiniGauge value={-5} label="-5%" color="#f43f5e" />
            </div>

            <div className="mt-5">
              <span className="text-[12px] font-semibold text-muted">Declined / Low Stock</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-rose-600">
                {lowItems.length}
              </div>
              <p className="mt-1.5 text-[11px] text-muted font-medium flex items-center justify-between">
                <span>{outOfStockItems.length} completely out</span>
                <span className="text-brand font-bold group-hover:underline">Reorder &rarr;</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: "Invoices" (The Centerpiece Violet Radial Card + Stacked White Cards) */}
      <div>
        <h2 className="text-lg font-black tracking-tight text-[#0f172a] mb-4">Invoices & Capital</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* THE SIGNATURE PURPLE HERO CARD (from reference image) */}
          <div className="lg:col-span-6 rounded-[34px] bg-gradient-to-br from-[#6366f1] via-[#7c3aed] to-[#4338ca] p-7 text-white shadow-purple relative overflow-hidden flex flex-col justify-between">
            {/* Ambient background glows */}
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/20 blur-2xl pointer-events-none" />

            {/* Top row with 3-dots */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-white/70">
                Capital Valuation
              </span>
              <button
                onClick={() => onNavigate("Reports")}
                className="rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Centered Speedometer Radial Gauge */}
            <div className="relative z-10 my-4 flex justify-center">
              <SpeedometerGauge percentage={healthPercentage} size={220} />
            </div>

            {/* Bottom info section with icon & amounts */}
            <div className="relative z-10 flex flex-col items-center text-center mt-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-white mb-2 shadow-xs">
                <TrendingUp size={20} />
              </div>
              <span className="text-[12px] font-semibold text-white/80">
                Amount Owed & Asset Value
              </span>
              <div className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                {money(totalStockCost, currency)}
              </div>
              <div className="mt-1 text-[12px] font-semibold text-white/70">
                Potential Retail Value: <span className="text-white font-bold">{money(totalStockRetail, currency)}</span>
              </div>
            </div>
          </div>

          {/* Right Stacked White Cards */}
          <div className="lg:col-span-6 flex flex-col gap-5 justify-between">
            {/* Card 1: Paid Invoices */}
            <div className="flex-1 rounded-[28px] border border-line/70 bg-white p-6 shadow-soft hover:shadow-card transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-[#f8f9fe] text-[#0f172a]">
                  <CreditCard size={18} strokeWidth={1.8} />
                </div>
                <CircularMiniGauge value={5} label="+5%" color="#10b981" />
              </div>

              <div className="mt-4">
                <span className="text-[12px] font-semibold text-muted">Paid Invoices</span>
                <div className="mt-1 text-3xl font-black tracking-tight text-[#0f172a]">
                  {money(paidAmount, currency)}
                </div>
                <p className="mt-1.5 text-[11px] text-muted font-medium flex items-center justify-between">
                  <span>Current Financial Cycle</span>
                  <span className="text-emerald-600 font-bold">{paidSales.length} settled orders</span>
                </p>
              </div>
            </div>

            {/* Card 2: Live Jobs Value / Stock Retail */}
            <div className="flex-1 rounded-[28px] border border-line/70 bg-white p-6 shadow-soft hover:shadow-card transition duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line/80 bg-[#f8f9fe] text-[#0f172a]">
                  <Target size={18} strokeWidth={1.8} />
                </div>
                <CircularMiniGauge value={85} label="85%" color="#7c3aed" />
              </div>

              <div className="mt-4">
                <span className="text-[12px] font-semibold text-muted">Live Inventory Realization</span>
                <div className="mt-1 text-3xl font-black tracking-tight text-[#0f172a]">
                  {money(totalStockRetail, currency)}
                </div>
                <p className="mt-1.5 text-[11px] text-muted font-medium flex items-center justify-between">
                  <span>Across {items.length} catalog products</span>
                  <span className="text-indigo-600 font-bold">+{money(grossProfit, currency)} profit</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: "History" / Transactions Ledger (matching bottom section) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black tracking-tight text-[#0f172a]">History</h2>
            {/* User Portrait Avatar like reference screenshot */}
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                JD
              </div>
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-tr from-emerald-500 to-teal-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                NS
              </div>
              <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-tr from-amber-500 to-orange-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                NE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("Sales")}
              className="text-[12px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              All Invoices <ArrowUpRight size={13} />
            </button>
            <span className="text-muted/40">|</span>
            <button
              onClick={() => onNavigate("Movements")}
              className="text-[12px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              Audit Trail <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-line/70 bg-white p-6 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-muted/70 border-b border-line pb-3">
                <tr>
                  <th className="pb-3 px-3">Entity & Customer</th>
                  <th className="pb-3 px-3">Reference #</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Items Summary</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {sales.slice(0, 5).map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onSelectSale(s)}
                    className="hover:bg-[#f8f9fe] transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-brand font-bold text-[11px]">
                          {s.customer.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#0f172a] group-hover:text-brand transition">
                            {s.customer}
                          </div>
                          <div className="text-[10px] text-muted">{s.customerEmail || "Customer"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-brand text-[11px]">
                      {s.id}
                    </td>

                    <td className="py-3.5 px-3 text-muted text-[11px]">{s.date}</td>

                    <td className="py-3.5 px-3 text-muted">
                      {s.items.length > 0
                        ? `${s.items[0].itemName} (${s.items[0].qty}x)${
                            s.items.length > 1 ? ` +${s.items.length - 1} more` : ""
                          }`
                        : "0 items"}
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-[#0f172a] tabular-nums">
                      {money(s.amount, currency)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : s.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
