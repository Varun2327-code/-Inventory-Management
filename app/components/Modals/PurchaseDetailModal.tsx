"use client";

import React from "react";
import { X, CheckCircle, Trash2, Calendar, Truck } from "lucide-react";
import { Purchase } from "../../types";
import { money } from "../../lib/formatters";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  purchase: Purchase | null;
  currency: string;
  onClose: () => void;
  onMarkReceived: (purchase: Purchase) => void;
  onDeletePurchase: (purchase: Purchase) => void;
}

export default function PurchaseDetailModal({
  isOpen,
  purchase,
  currency,
  onClose,
  onMarkReceived,
  onDeletePurchase,
}: PurchaseDetailModalProps) {
  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[92vh] w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-brand">{purchase.id}</span>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                purchase.status === "Received"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {purchase.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-muted">Supplier</div>
            <div className="text-base font-bold text-ink">{purchase.supplier}</div>
            {purchase.supplierEmail && (
              <div className="text-[11px] text-muted">{purchase.supplierEmail}</div>
            )}
          </div>
          <div className="text-right text-[11px] text-muted">
            <div className="flex items-center justify-end gap-1">
              <Calendar size={13} /> {purchase.date}
            </div>
            <div className="mt-1 flex items-center justify-end gap-1">
              <Truck size={13} /> Direct PO
            </div>
          </div>
        </div>

        {/* Ordered items table */}
        <div className="mt-5 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-3.5 py-2.5">Item</th>
                <th className="px-3 py-2.5 text-center">Units</th>
                <th className="px-3 py-2.5 text-right">Cost / Unit</th>
                <th className="px-3.5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {purchase.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-canvas/30">
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-ink">{it.itemName}</div>
                    <div className="font-mono text-[9px] text-muted">{it.sku}</div>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-ink">{it.qty}</td>
                  <td className="px-3 py-2.5 text-right text-muted">
                    {money(it.unitCost, currency)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-ink">
                    {money(it.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3.5 flex justify-end text-[13px] font-bold text-ink">
          <span>Total Order Value: </span>
          <span className="ml-2 text-brand">{money(purchase.amount, currency)}</span>
        </div>

        {purchase.notes && (
          <div className="mt-4 rounded-xl bg-canvas p-3 text-[11px] text-muted">
            <span className="font-semibold text-ink block mb-0.5">Notes:</span>
            {purchase.notes}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDeletePurchase(purchase);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Delete PO
          </button>

          {purchase.status === "Pending" ? (
            <button
              type="button"
              onClick={() => {
                onMarkReceived(purchase);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#185940] transition"
            >
              <CheckCircle size={14} /> Mark as Received (Add Stock)
            </button>
          ) : (
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Completed & Stock Added
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
