"use client";

import React from "react";
import { X, Printer, CheckCircle, Trash2, Calendar, CreditCard, Building } from "lucide-react";
import { Sale } from "../../types";
import { money } from "../../lib/formatters";

interface SaleDetailModalProps {
  isOpen: boolean;
  sale: Sale | null;
  currency: string;
  companyName: string;
  onClose: () => void;
  onMarkPaid: (saleId: string) => void;
  onDeleteSale: (sale: Sale) => void;
}

export default function SaleDetailModal({
  isOpen,
  sale,
  currency,
  companyName,
  onClose,
  onMarkPaid,
  onDeleteSale,
}: SaleDetailModalProps) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusColor =
    sale.status === "Paid"
      ? "bg-emerald-100 text-emerald-800"
      : sale.status === "Pending"
      ? "bg-amber-100 text-amber-800"
      : sale.status === "Overdue"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl print:max-w-none print:shadow-none print:p-0">
        <div className="flex items-start justify-between border-b border-line pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-brand">{sale.id}</span>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
              {sale.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Invoice Header */}
        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="text-xl font-black tracking-tight text-ink">
              {companyName || "StockPilot Co."}
            </div>
            <div className="text-[11px] text-muted">Commercial Tax Invoice</div>
            <div className="mt-2 text-[12px] font-bold text-ink">Billed To:</div>
            <div className="text-[12px] text-ink font-semibold">{sale.customer}</div>
            {sale.customerEmail && (
              <div className="text-[11px] text-muted">{sale.customerEmail}</div>
            )}
          </div>
          <div className="text-right text-[11px]">
            <div className="text-base font-black text-brand">{sale.id}</div>
            <div className="mt-1 flex items-center justify-end gap-1 text-muted">
              <Calendar size={12} /> {sale.date}
            </div>
            {sale.paymentMethod && (
              <div className="mt-1 flex items-center justify-end gap-1 text-muted">
                <CreditCard size={12} /> {sale.paymentMethod}
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-3.5 py-2.5">Item Description</th>
                <th className="px-3 py-2.5 text-center">Qty</th>
                <th className="px-3 py-2.5 text-right">Unit Price</th>
                <th className="px-3.5 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sale.items.map((it, idx) => (
                <tr key={idx} className="hover:bg-canvas/30">
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-ink">{it.itemName}</div>
                    <div className="font-mono text-[9px] text-muted">{it.sku}</div>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-ink">{it.qty}</td>
                  <td className="px-3 py-2.5 text-right text-muted">
                    {money(it.unitPrice, currency)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-ink">
                    {money(it.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="mt-4 flex flex-col items-end gap-1.5 text-[11px]">
          <div className="flex justify-between w-56 text-muted">
            <span>Subtotal:</span>
            <span className="font-semibold text-ink">{money(sale.subtotal, currency)}</span>
          </div>
          {sale.tax > 0 && (
            <div className="flex justify-between w-56 text-muted">
              <span>Tax:</span>
              <span className="font-semibold text-ink">{money(sale.tax, currency)}</span>
            </div>
          )}
          {sale.discount > 0 && (
            <div className="flex justify-between w-56 text-muted">
              <span>Discount:</span>
              <span className="font-semibold text-red-500">-{money(sale.discount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between w-56 border-t border-line pt-1 text-[13px] font-bold text-ink">
            <span>Total:</span>
            <span className="text-brand">{money(sale.amount, currency)}</span>
          </div>
        </div>

        {sale.notes && (
          <div className="mt-4 rounded-xl bg-canvas p-3 text-[11px] text-muted">
            <span className="font-semibold text-ink block mb-0.5">Notes:</span>
            {sale.notes}
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 print:hidden">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDeleteSale(sale);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Cancel / Delete Invoice
          </button>

          <div className="flex items-center gap-2">
            {sale.status !== "Paid" && (
              <button
                type="button"
                onClick={() => {
                  onMarkPaid(sale.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
              >
                <CheckCircle size={14} /> Mark as Paid
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-line px-3.5 py-2 text-[11px] font-semibold text-ink hover:bg-canvas transition"
            >
              <Printer size={14} /> Print / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
