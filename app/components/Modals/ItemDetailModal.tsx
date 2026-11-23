"use client";

import React from "react";
import { X, Edit2, Trash2, Sliders, MapPin, Building, Calendar, Package, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Item, Movement } from "../../types";
import { money } from "../../lib/formatters";

interface ItemDetailModalProps {
  isOpen: boolean;
  item: Item | null;
  movements: Movement[];
  currency: string;
  onClose: () => void;
  onEdit: (item: Item) => void;
  onAdjust: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export default function ItemDetailModal({
  isOpen,
  item,
  movements,
  currency,
  onClose,
  onEdit,
  onAdjust,
  onDelete,
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const itemMovements = movements.filter((m) => m.itemId === item.id || m.sku === item.sku);
  const totalCostVal = item.qty * item.cost;
  const totalRetailVal = item.qty * item.price;
  const unitProfit = item.price - item.cost;
  const marginPct = item.price > 0 ? ((unitProfit / item.price) * 100).toFixed(1) : "0";

  const isLow = item.qty <= item.min && item.qty > 0;
  const isOut = item.qty === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold text-brand uppercase">
                {item.category}
              </span>
              <span className="font-mono text-[11px] text-muted">{item.sku}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-ink">{item.name}</h2>
            {item.description && (
              <p className="mt-1 text-[11px] text-muted">{item.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Stock Indicator Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas/50 p-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
              Stock Status
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  isOut
                    ? "bg-red-100 text-red-700"
                    : isLow
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isOut ? "Out of Stock" : isLow ? "Low Stock Warning" : "Healthy Stock"}
              </span>
              <span className="text-[12px] text-muted font-medium">
                (Min Level: {item.min} units)
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
              Available Units
            </div>
            <div className="text-2xl font-black text-ink">{item.qty}</div>
          </div>
        </div>

        {/* Financial KPIs Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-line bg-white p-3 shadow-xs">
            <div className="text-[10px] text-muted">Cost Price</div>
            <div className="mt-1 text-base font-bold text-ink">{money(item.cost, currency)}</div>
          </div>
          <div className="rounded-xl border border-line bg-white p-3 shadow-xs">
            <div className="text-[10px] text-muted">Selling Price</div>
            <div className="mt-1 text-base font-bold text-brand">{money(item.price, currency)}</div>
          </div>
          <div className="rounded-xl border border-line bg-white p-3 shadow-xs">
            <div className="text-[10px] text-muted">Profit Margin</div>
            <div className="mt-1 text-base font-bold text-emerald-700">{marginPct}%</div>
            <div className="text-[9px] text-muted">+{money(unitProfit, currency)} / unit</div>
          </div>
          <div className="rounded-xl border border-line bg-white p-3 shadow-xs">
            <div className="text-[10px] text-muted">Asset Value</div>
            <div className="mt-1 text-base font-bold text-ink">
              {money(totalCostVal, currency)}
            </div>
            <div className="text-[9px] text-muted">Retail: {money(totalRetailVal, currency)}</div>
          </div>
        </div>

        {/* Location & Meta Info */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] rounded-xl border border-line p-3 bg-canvas/30">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-brand shrink-0" />
            <span className="text-muted">Location:</span>
            <span className="font-semibold text-ink">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building size={15} className="text-brand shrink-0" />
            <span className="text-muted">Supplier:</span>
            <span className="font-semibold text-ink">{item.supplier || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-brand shrink-0" />
            <span className="text-muted">Added on:</span>
            <span className="font-semibold text-ink">{item.createdAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package size={15} className="text-brand shrink-0" />
            <span className="text-muted">Inventory ID:</span>
            <span className="font-semibold text-ink">#{item.id}</span>
          </div>
        </div>

        {/* Movement History */}
        <div className="mt-5">
          <h3 className="text-[12px] font-bold text-ink uppercase tracking-wider mb-2">
            Stock Activity Log ({itemMovements.length})
          </h3>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-line divide-y divide-line">
            {itemMovements.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-muted">
                No recorded stock movements for this item yet.
              </div>
            ) : (
              itemMovements.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md ${
                        m.qtyDelta > 0
                          ? "bg-emerald-100 text-brand"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {m.qtyDelta > 0 ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                    </div>
                    <div>
                      <span className="font-semibold text-ink">{m.reason}</span>
                      <div className="text-[9px] text-muted">
                        {m.date} {m.reference ? `· ${m.reference}` : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold tabular-nums ${
                      m.qtyDelta > 0 ? "text-brand" : "text-red-500"
                    }`}
                  >
                    {m.qtyDelta > 0 ? `+${m.qtyDelta}` : m.qtyDelta} units
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(item);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Delete Item
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAdjust(item);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-[11px] font-semibold text-ink hover:bg-canvas transition"
            >
              <Sliders size={14} /> Adjust Stock
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#185940] transition"
            >
              <Edit2 size={14} /> Edit Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
