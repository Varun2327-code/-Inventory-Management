"use client";

import React, { useState } from "react";
import { X, ArrowUpRight, ArrowDownLeft, Sliders, AlertCircle } from "lucide-react";
import { Item, Movement } from "../../types";

interface AdjustStockModalProps {
  isOpen: boolean;
  item: Item | null;
  onClose: () => void;
  onAdjust: (itemId: number, newQty: number, movement: Movement) => void;
}

export default function AdjustStockModal({
  isOpen,
  item,
  onClose,
  onAdjust,
}: AdjustStockModalProps) {
  const [mode, setMode] = useState<"add" | "deduct" | "set">("add");
  const [amount, setAmount] = useState<string>("5");
  const [reason, setReason] = useState<string>("Stock restock / Received");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!isOpen || !item) return null;

  const numAmount = parseInt(amount) || 0;
  let finalQty = item.qty;
  let delta = 0;

  if (mode === "add") {
    finalQty = item.qty + numAmount;
    delta = numAmount;
  } else if (mode === "deduct") {
    finalQty = Math.max(0, item.qty - numAmount);
    delta = -(item.qty - finalQty);
  } else {
    finalQty = Math.max(0, numAmount);
    delta = finalQty - item.qty;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 0) {
      setError("Please enter a valid positive number.");
      return;
    }
    if (mode === "deduct" && numAmount > item.qty) {
      setError(`Cannot deduct ${numAmount} units. Only ${item.qty} available.`);
      return;
    }

    const movement: Movement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      type: "adjustment",
      qtyDelta: delta,
      reason: `${reason}${notes ? ` - ${notes}` : ""}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " " +
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      reference: "Manual Adjustment",
    };

    onAdjust(item.id, finalQty, movement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Inventory Level Update
            </span>
            <h2 className="text-base font-bold text-ink">Adjust Stock: {item.name}</h2>
            <div className="text-[11px] text-muted">SKU: {item.sku}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-[11px] text-red-600 border border-red-200">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-canvas p-1">
            <button
              type="button"
              onClick={() => {
                setMode("add");
                setReason("Stock restock / Received");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition ${
                mode === "add" ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              <ArrowDownLeft size={13} /> Add (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("deduct");
                setReason("Damaged / Expired goods");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition ${
                mode === "deduct" ? "bg-white text-red-600 shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              <ArrowUpRight size={13} /> Deduct (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("set");
                setReason("Inventory Recount / Audit");
                setError("");
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition ${
                mode === "set" ? "bg-white text-blue-600 shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              <Sliders size={13} /> Set Exact (=)
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-canvas/30 p-3">
            <div>
              <div className="text-[10px] text-muted">Current Stock</div>
              <div className="text-xl font-bold text-ink">{item.qty} units</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-muted">Change</div>
              <div
                className={`text-xl font-bold ${
                  delta > 0 ? "text-brand" : delta < 0 ? "text-red-500" : "text-muted"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted">New Stock</div>
              <div className="text-xl font-bold text-brand">{finalQty} units</div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">
              {mode === "set" ? "New Total Count" : "Quantity Units"}
            </label>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[13px] font-semibold outline-none focus:border-brand focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white"
            >
              <option value="Stock restock / Received">Stock restock / Received</option>
              <option value="Damaged / Expired goods">Damaged / Expired goods</option>
              <option value="Customer return / Restock">Customer return / Restock</option>
              <option value="Inventory Recount / Audit">Inventory Recount / Audit</option>
              <option value="Sold offline / Walk-in">Sold offline / Walk-in</option>
              <option value="Internal usage / Sampling">Internal usage / Sampling</option>
              <option value="Other adjustment">Other adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">
              Internal Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved by warehouse manager"
              className="w-full rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[11px] outline-none focus:border-brand focus:bg-white"
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
              className="rounded-xl bg-brand px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#185940] transition"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
