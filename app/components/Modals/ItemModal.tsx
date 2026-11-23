"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { Item } from "../../types";
import { generateSKU } from "../../lib/formatters";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  existingItem?: Item | null;
  existingItems: Item[];
  currency: string;
}

const CATEGORIES = [
  "Electronics",
  "Office",
  "Accessories",
  "Apparel",
  "Furniture",
  "Industrial",
  "Food & Beverage",
  "Other",
];

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  existingItem,
  existingItems,
  currency,
}: ItemModalProps) {
  const isEditing = Boolean(existingItem);

  const [name, setName] = useState(existingItem?.name || "");
  const [sku, setSku] = useState(existingItem?.sku || "");
  const [category, setCategory] = useState(existingItem?.category || "Electronics");
  const [qty, setQty] = useState(existingItem ? String(existingItem.qty) : "10");
  const [min, setMin] = useState(existingItem ? String(existingItem.min) : "5");
  const [cost, setCost] = useState(existingItem ? String(existingItem.cost) : "20");
  const [price, setPrice] = useState(existingItem ? String(existingItem.price) : "40");
  const [location, setLocation] = useState(existingItem?.location || "Main warehouse - A1");
  const [supplier, setSupplier] = useState(existingItem?.supplier || "Nova Electronics");
  const [description, setDescription] = useState(existingItem?.description || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleGenerateSKU = () => {
    setSku(generateSKU(category, name));
  };

  const costNum = parseFloat(cost) || 0;
  const priceNum = parseFloat(price) || 0;
  const margin = priceNum > 0 ? (((priceNum - costNum) / priceNum) * 100).toFixed(1) : "0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an item name.");
      return;
    }
    if (!sku.trim()) {
      setError("Please specify a SKU code.");
      return;
    }

    // Check SKU duplicate if new or changed
    const duplicate = existingItems.find(
      (it) => it.sku.toLowerCase() === sku.trim().toLowerCase() && it.id !== existingItem?.id
    );
    if (duplicate) {
      setError(`SKU "${sku}" is already used by "${duplicate.name}". Please use a unique SKU.`);
      return;
    }

    const newItem: Item = {
      id: existingItem ? existingItem.id : Date.now(),
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      qty: Math.max(0, parseInt(qty) || 0),
      min: Math.max(0, parseInt(min) || 0),
      cost: Math.max(0, parseFloat(cost) || 0),
      price: Math.max(0, parseFloat(price) || 0),
      location: location.trim() || "Main warehouse",
      supplier: supplier.trim() || undefined,
      description: description.trim() || undefined,
      createdAt: existingItem ? existingItem.createdAt : new Date().toISOString().slice(0, 10),
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              {isEditing ? "Modify Product" : "New Catalog Entry"}
            </span>
            <h2 className="text-lg font-bold text-ink">
              {isEditing ? `Edit Item: ${existingItem?.name}` : "Add New Inventory Item"}
            </h2>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Wireless Ergonomic Mouse"
              className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-ink">
                  SKU Code <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSKU}
                  className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
                >
                  <Sparkles size={11} /> Auto-generate
                </button>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  setError("");
                }}
                placeholder="e.g. EL-2055"
                className="w-full font-mono uppercase rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Stock Qty</label>
              <input
                type="number"
                min="0"
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Min Level</label>
              <input
                type="number"
                min="0"
                required
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Cost ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Price ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
          </div>

          <div className="rounded-xl bg-canvas p-3 text-[11px] flex items-center justify-between">
            <span className="text-muted">Estimated Gross Margin:</span>
            <span
              className={`font-bold ${
                parseFloat(margin) > 30
                  ? "text-brand"
                  : parseFloat(margin) > 0
                  ? "text-amber-600"
                  : "text-red-500"
              }`}
            >
              {margin}% ({currency}
              {(priceNum - costNum).toFixed(2)} profit / unit)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Storage Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main warehouse - Bay 4"
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Primary Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Nova Distribution"
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-[12px] outline-none focus:border-brand focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Features, barcode reference, warranty notes..."
              className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2 text-[12px] outline-none focus:border-brand focus:bg-white transition resize-none"
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
              {isEditing ? "Save Changes" : "Add to Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
