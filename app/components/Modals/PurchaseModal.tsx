"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import { Item, Movement, Purchase, PurchaseLineItem } from "../../types";
import { money } from "../../lib/formatters";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  currency: string;
  nextPoNum: number;
  onCreatePurchase: (
    purchase: Purchase,
    movements: Movement[],
    itemUpdates: { id: number; newQty: number }[]
  ) => void;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  items,
  currency,
  nextPoNum,
  onCreatePurchase,
}: PurchaseModalProps) {
  const [supplier, setSupplier] = useState("Nova Electronics");
  const [supplierEmail, setSupplierEmail] = useState("wholesale@nova-elec.com");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<"Received" | "Pending">("Received");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const [lineItems, setLineItems] = useState<{ itemId: number; qty: number; unitCost: number }[]>(
    () => {
      if (items.length > 0) {
        return [{ itemId: items[0].id, qty: 25, unitCost: items[0].cost }];
      }
      return [];
    }
  );

  if (!isOpen) return null;

  const handleAddLineItem = () => {
    if (items.length === 0) return;
    setLineItems((prev) => [
      ...prev,
      { itemId: items[0].id, qty: 10, unitCost: items[0].cost },
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
        i === index ? { ...line, itemId: selected.id, unitCost: selected.cost } : line
      )
    );
  };

  const handleQtyChange = (index: number, val: number) => {
    setLineItems((prev) =>
      prev.map((line, i) => (i === index ? { ...line, qty: Math.max(1, val) } : line))
    );
  };

  const handleCostChange = (index: number, val: number) => {
    setLineItems((prev) =>
      prev.map((line, i) => (i === index ? { ...line, unitCost: Math.max(0, val) } : line))
    );
  };

  const totalAmount = lineItems.reduce((acc, line) => acc + line.qty * line.unitCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier.trim()) {
      setError("Please specify a supplier name.");
      return;
    }
    if (lineItems.length === 0) {
      setError("Please add at least one item to the purchase order.");
      return;
    }

    const poId = `PO-${nextPoNum}`;
    const nowStr =
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const finalPoItems: PurchaseLineItem[] = [];
    const itemUpdates: { id: number; newQty: number }[] = [];
    const movements: Movement[] = [];

    // Group items by id
    const orderedQuantities = new Map<number, number>();
    for (const line of lineItems) {
      const current = orderedQuantities.get(line.itemId) || 0;
      orderedQuantities.set(line.itemId, current + line.qty);
    }

    for (const line of lineItems) {
      const invItem = items.find((i) => i.id === line.itemId);
      if (invItem) {
        finalPoItems.push({
          itemId: invItem.id,
          itemName: invItem.name,
          sku: invItem.sku,
          qty: line.qty,
          unitCost: line.unitCost,
          total: line.qty * line.unitCost,
        });
      }
    }

    // If marked as Received, immediately update inventory stock & record movements
    if (status === "Received") {
      Array.from(orderedQuantities.entries()).forEach(([itemId, addQty]) => {
        const invItem = items.find((i) => i.id === itemId);
        if (invItem) {
          itemUpdates.push({
            id: invItem.id,
            newQty: invItem.qty + addQty,
          });

          movements.push({
            id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            itemId: invItem.id,
            itemName: invItem.name,
            sku: invItem.sku,
            type: "purchase",
            qtyDelta: addQty,
            reason: `Purchase order received from ${supplier}`,
            date: nowStr,
            reference: poId,
          });
        }
      });
    }

    const newPurchase: Purchase = {
      id: poId,
      supplier: supplier.trim(),
      supplierEmail: supplierEmail.trim() || undefined,
      date,
      status,
      items: finalPoItems,
      amount: totalAmount,
      notes: notes.trim() || undefined,
    };

    onCreatePurchase(newPurchase, movements, itemUpdates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[92vh] w-full max-w-[660px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Procurement & Restock
            </span>
            <h2 className="text-lg font-bold text-ink">New Purchase Order</h2>
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
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => {
                  setSupplier(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Nova Distribution"
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Supplier Email
              </label>
              <input
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                placeholder="sales@supplier.com"
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Order Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "Received" | "Pending")}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
              >
                <option value="Received">Received (Immediately adds stock to inventory)</option>
                <option value="Pending">Pending Delivery (Stock added when marked received)</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-xl border border-line bg-canvas/30 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink">
                Ordered Products ({lineItems.length})
              </span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="flex items-center gap-1 rounded-lg bg-white border border-line px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-canvas"
              >
                <Plus size={13} /> Add Product
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="p-4 text-center text-[12px] text-muted">
                No items added. Click &quot;+ Add Product&quot;.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {lineItems.map((line, idx) => (
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
                          <option key={it.id} value={it.id}>
                            {it.name} ({it.sku}) · currently {it.qty} in stock
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <label className="text-[9px] text-muted block">Order Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={line.qty}
                        onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full rounded-lg border border-line px-2 py-1 text-[12px] font-semibold text-ink text-center"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[9px] text-muted block">Cost / Unit ({currency})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unitCost}
                        onChange={(e) => handleCostChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-line px-2 py-1 text-[12px] font-semibold text-ink text-right"
                      />
                    </div>

                    <div className="w-20 text-right">
                      <label className="text-[9px] text-muted block">Total</label>
                      <div className="text-[12px] font-bold text-brand">
                        {money(line.qty * line.unitCost, currency)}
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
                ))}
              </div>
            )}

            <div className="mt-3.5 border-t border-line pt-2.5 flex justify-between items-center text-[12px]">
              <span className="text-muted">Total Purchase Value:</span>
              <span className="text-base font-bold text-brand">
                {money(totalAmount, currency)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">
              Internal PO Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Expected shipment arrival via DHL"
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
              {status === "Received" ? "Create & Add to Stock" : "Create Pending PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
