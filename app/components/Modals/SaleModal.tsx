"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import { Item, Movement, Sale, SaleLineItem } from "../../types";
import { money } from "../../lib/formatters";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  currency: string;
  defaultTaxRate: number;
  nextInvoiceNum: number;
  onCreateSale: (sale: Sale, movements: Movement[], itemUpdates: { id: number; newQty: number }[]) => void;
}

export default function SaleModal({
  isOpen,
  onClose,
  items,
  currency,
  defaultTaxRate,
  nextInvoiceNum,
  onCreateSale,
}: SaleModalProps) {
  const [customer, setCustomer] = useState("Northstar Studio");
  const [customerEmail, setCustomerEmail] = useState("finance@northstar.design");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"Paid" | "Pending">("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [notes, setNotes] = useState("");
  const [taxPercent, setTaxPercent] = useState(defaultTaxRate.toString());
  const [discountAmount, setDiscountAmount] = useState("0");
  const [error, setError] = useState("");

  const availableItems = items.filter((i) => i.qty > 0);

  const [lineItems, setLineItems] = useState<
    { itemId: number; qty: number; unitPrice: number }[]
  >(() => {
    if (availableItems.length > 0) {
      return [{ itemId: availableItems[0].id, qty: 1, unitPrice: availableItems[0].price }];
    }
    return [];
  });

  if (!isOpen) return null;

  const handleAddLineItem = () => {
    if (availableItems.length === 0) return;
    setLineItems((prev) => [
      ...prev,
      { itemId: availableItems[0].id, qty: 1, unitPrice: availableItems[0].price },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, itemId: number) => {
    const selected = items.find((i) => i.id === itemId);
    if (!selected) return;
    setLineItems((prev) =>
      prev.map((line, i) =>
        i === index
          ? { ...line, itemId: selected.id, unitPrice: selected.price, qty: Math.min(line.qty, selected.qty || 1) }
          : line
      )
    );
  };

  const handleQtyChange = (index: number, val: number) => {
    setLineItems((prev) =>
      prev.map((line, i) => (i === index ? { ...line, qty: Math.max(1, val) } : line))
    );
  };

  const handlePriceChange = (index: number, val: number) => {
    setLineItems((prev) =>
      prev.map((line, i) => (i === index ? { ...line, unitPrice: Math.max(0, val) } : line))
    );
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
  const taxRate = parseFloat(taxPercent) || 0;
  const tax = (subtotal * taxRate) / 100;
  const discount = Math.min(subtotal, parseFloat(discountAmount) || 0);
  const total = Math.max(0, subtotal + tax - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) {
      setError("Please specify a customer name.");
      return;
    }
    if (lineItems.length === 0) {
      setError("Please add at least one item to the invoice.");
      return;
    }

    // Verify stock availability
    const requestedQuantities = new Map<number, number>();
    for (const line of lineItems) {
      const current = requestedQuantities.get(line.itemId) || 0;
      requestedQuantities.set(line.itemId, current + line.qty);
    }

    const itemUpdates: { id: number; newQty: number }[] = [];
    const movements: Movement[] = [];
    const invoiceId = `INV-${nextInvoiceNum}`;
    const nowStr =
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const finalSaleItems: SaleLineItem[] = [];

    let hasError = false;
    Array.from(requestedQuantities.entries()).forEach(([itemId, reqQty]) => {
      if (hasError) return;
      const invItem = items.find((i) => i.id === itemId);
      if (!invItem) {
        setError("One of the selected items was not found.");
        hasError = true;
        return;
      }
      if (reqQty > invItem.qty) {
        setError(
          `Insufficient stock for "${invItem.name}". Requested ${reqQty}, but only ${invItem.qty} available.`
        );
        hasError = true;
        return;
      }

      itemUpdates.push({
        id: invItem.id,
        newQty: invItem.qty - reqQty,
      });

      movements.push({
        id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemId: invItem.id,
        itemName: invItem.name,
        sku: invItem.sku,
        type: "sale",
        qtyDelta: -reqQty,
        reason: `Sale fulfilled to ${customer}`,
        date: nowStr,
        reference: invoiceId,
      });
    });

    if (hasError) return;

    for (const line of lineItems) {
      const invItem = items.find((i) => i.id === line.itemId)!;
      finalSaleItems.push({
        itemId: invItem.id,
        itemName: invItem.name,
        sku: invItem.sku,
        qty: line.qty,
        unitPrice: line.unitPrice,
        unitCost: invItem.cost,
        total: line.qty * line.unitPrice,
      });
    }

    const newSale: Sale = {
      id: invoiceId,
      customer: customer.trim(),
      customerEmail: customerEmail.trim() || undefined,
      date,
      status,
      items: finalSaleItems,
      subtotal,
      tax,
      discount,
      amount: total,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    onCreateSale(newSale, movements, itemUpdates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Billing & Fulfillment
            </span>
            <h2 className="text-lg font-bold text-ink">Create New Sales Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-[12px] text-red-600 border border-red-200">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Customer / Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Customer Email (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="billing@client.com"
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Paid" | "Pending")}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              >
                <option value="Paid">Paid (Immediate)</option>
                <option value="Pending">Pending (Invoice Net 15/30)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer / Wire</option>
                <option value="Cash">Cash</option>
                <option value="Stripe">Stripe</option>
                <option value="UPI / Online">UPI / Online</option>
              </select>
            </div>
          </div>

          {/* Line Items Picker */}
          <div className="rounded-xl border border-line bg-canvas/30 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
                Line Items ({lineItems.length})
              </span>
              <button
                type="button"
                onClick={handleAddLineItem}
                disabled={availableItems.length === 0}
                className="flex items-center gap-1 rounded-lg bg-white border border-line px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-canvas disabled:opacity-50"
              >
                <Plus size={13} /> Add Product
              </button>
            </div>

            {availableItems.length === 0 ? (
              <div className="p-4 text-center text-[12px] text-amber-600">
                All inventory items are currently out of stock! Restock or add items first.
              </div>
            ) : lineItems.length === 0 ? (
              <div className="p-4 text-center text-[12px] text-muted">
                No items added. Click &quot;+ Add Product&quot; above.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {lineItems.map((line, idx) => {
                  const currentItem = items.find((i) => i.id === line.itemId);
                  return (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-white border border-line p-2.5 shadow-xs"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <select
                          value={line.itemId}
                          onChange={(e) => handleItemChange(idx, Number(e.target.value))}
                          className="w-full text-[12px] font-semibold text-ink bg-transparent outline-none"
                        >
                          {items.map((it) => (
                            <option key={it.id} value={it.id} disabled={it.qty === 0}>
                              {it.name} ({it.sku}) · {it.qty} in stock
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-20">
                        <label className="text-[9px] text-muted block">Qty</label>
                        <input
                          type="number"
                          min="1"
                          max={currentItem?.qty || 9999}
                          value={line.qty}
                          onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                          className="w-full rounded-lg border border-line px-2 py-1 text-[12px] font-semibold text-ink text-center"
                        />
                      </div>

                      <div className="w-24">
                        <label className="text-[9px] text-muted block">Price ({currency})</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) =>
                            handlePriceChange(idx, parseFloat(e.target.value) || 0)
                          }
                          className="w-full rounded-lg border border-line px-2 py-1 text-[12px] font-semibold text-ink text-right"
                        />
                      </div>

                      <div className="w-20 text-right">
                        <label className="text-[9px] text-muted block">Total</label>
                        <div className="text-[12px] font-bold text-brand">
                          {money(line.qty * line.unitPrice, currency)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="mt-3.5 border-t border-line pt-3 flex flex-col items-end gap-1.5 text-[11px]">
              <div className="flex justify-between w-64 text-muted">
                <span>Subtotal:</span>
                <span className="font-semibold text-ink">{money(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between w-64 text-muted">
                <span>Tax (%):</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-16 rounded border border-line px-1.5 py-0.5 text-right font-semibold text-ink text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between w-64 text-muted">
                <span>Discount ({currency}):</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-20 rounded border border-line px-1.5 py-0.5 text-right font-semibold text-ink text-[11px]"
                />
              </div>
              <div className="flex justify-between w-64 border-t border-line pt-1 text-[13px] font-bold text-ink">
                <span>Total Amount:</span>
                <span className="text-brand">{money(total, currency)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">
              Invoice Memo / Delivery Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivered via FedEx Express · tracking #994827"
              className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2.5 text-[12px] font-semibold text-muted hover:bg-canvas transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={lineItems.length === 0}
              className="rounded-xl bg-brand px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#185940] transition disabled:opacity-50"
            >
              Confirm & Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
