"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Sliders,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Boxes,
} from "lucide-react";
import { Item } from "../../types";
import { money } from "../../lib/formatters";
import { exportItemsToCSV } from "../../lib/csv";

interface StockTabProps {
  items: Item[];
  currency: string;
  onAddItem: () => void;
  onViewItem: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onAdjustItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
}

export default function StockTab({
  items,
  currency,
  onAddItem,
  onViewItem,
  onEditItem,
  onAdjustItem,
  onDeleteItem,
}: StockTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Items");
  const [sortBy, setSortBy] = useState<"name" | "qtyAsc" | "qtyDesc" | "value" | "price">("name");

  // Dynamic categories list
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All Categories", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        const q = search.toLowerCase();
        const matchesQuery =
          !q ||
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          (i.supplier && i.supplier.toLowerCase().includes(q));

        const matchesCat = categoryFilter === "All Categories" || i.category === categoryFilter;

        let matchesStatus = true;
        if (statusFilter === "In Stock") {
          matchesStatus = i.qty > i.min;
        } else if (statusFilter === "Low Stock") {
          matchesStatus = i.qty <= i.min && i.qty > 0;
        } else if (statusFilter === "Out of Stock") {
          matchesStatus = i.qty === 0;
        }

        return matchesQuery && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "qtyAsc") return a.qty - b.qty;
        if (sortBy === "qtyDesc") return b.qty - a.qty;
        if (sortBy === "value") return b.qty * b.cost - a.qty * a.cost;
        if (sortBy === "price") return b.price - a.price;
        return 0;
      });
  }, [items, search, categoryFilter, statusFilter, sortBy]);

  const totalSKUs = items.length;
  const totalUnits = items.reduce((s, i) => s + i.qty, 0);
  const totalAssetCost = items.reduce((s, i) => s + i.qty * i.cost, 0);
  const totalRetailVal = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">
            INVENTORY MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Products & Stock On Hand</h1>
          <p className="mt-1 text-[12px] text-muted">
            Track unit levels, SKU codes, warehouse storage bins, purchase costs, and sales prices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportItemsToCSV(items)}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[11px] font-semibold text-ink shadow-xs hover:bg-canvas transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={onAddItem}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm hover:bg-[#185940] transition"
          >
            <Plus size={15} /> Add New Product
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Active SKUs</div>
          <div className="mt-1 text-2xl font-bold text-ink">{totalSKUs}</div>
          <div className="text-[10px] text-muted">Unique catalog products</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Total Units On Hand</div>
          <div className="mt-1 text-2xl font-bold text-brand">{totalUnits.toLocaleString()}</div>
          <div className="text-[10px] text-muted">Stored across warehouses</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Asset Value (Cost)</div>
          <div className="mt-1 text-2xl font-bold text-ink">
            {money(totalAssetCost, currency)}
          </div>
          <div className="text-[10px] text-muted">Total inventory procurement</div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-soft">
          <div className="text-[11px] text-muted">Potential Retail Value</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {money(totalRetailVal, currency)}
          </div>
          <div className="text-[10px] text-muted">If all units sold at list price</div>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-line bg-white p-3 shadow-soft">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-line bg-canvas/40 px-3 py-2">
          <Search size={15} className="text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, category, location, supplier..."
            className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[11px]">
            <Filter size={13} className="text-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent outline-none font-medium text-ink text-[11px]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[11px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none font-medium text-ink text-[11px]"
            >
              <option value="All Items">All Statuses</option>
              <option value="In Stock">In Stock Only</option>
              <option value="Low Stock">Low Stock Alerts</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[11px]">
            <ArrowUpDown size={13} className="text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent outline-none font-medium text-ink text-[11px]"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="qtyDesc">Stock: High to Low</option>
              <option value="qtyAsc">Stock: Low to High</option>
              <option value="value">Asset Value (Highest)</option>
              <option value="price">Price (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-[12px]">
            <thead className="bg-[#fafbfa] text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line">
              <tr>
                <th className="px-5 py-3.5">Product & Location</th>
                <th className="px-4 py-3.5">SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-center">On Hand</th>
                <th className="px-4 py-3.5 text-center">Min Level</th>
                <th className="px-4 py-3.5 text-right">Cost</th>
                <th className="px-4 py-3.5 text-right">Price</th>
                <th className="px-4 py-3.5 text-right">Total Value</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredItems.map((item) => {
                const isOut = item.qty === 0;
                const isLow = item.qty <= item.min && item.qty > 0;
                const itemVal = item.qty * item.cost;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-canvas/40 transition group cursor-default"
                  >
                    <td className="px-5 py-3.5">
                      <div
                        onClick={() => onViewItem(item)}
                        className="font-semibold text-ink hover:text-brand cursor-pointer"
                      >
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted flex items-center gap-1.5 mt-0.5">
                        <span>{item.location}</span>
                        {item.supplier && <span>· {item.supplier}</span>}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-muted font-medium">
                      {item.sku}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-ink tabular-nums">
                      {item.qty}
                    </td>

                    <td className="px-4 py-3.5 text-center text-muted tabular-nums">
                      {item.min}
                    </td>

                    <td className="px-4 py-3.5 text-right text-muted tabular-nums">
                      {money(item.cost, currency)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-semibold text-ink tabular-nums">
                      {money(item.price, currency)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-ink tabular-nums">
                      {money(itemVal, currency)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut
                            ? "bg-red-100 text-red-700"
                            : isLow
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isOut ? "Out of stock" : isLow ? "Low stock" : "In stock"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewItem(item)}
                          title="View Details"
                          className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onAdjustItem(item)}
                          title="Adjust Stock Qty"
                          className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-brand transition"
                        >
                          <Sliders size={15} />
                        </button>
                        <button
                          onClick={() => onEditItem(item)}
                          title="Edit Item"
                          className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-blue-600 transition"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item)}
                          title="Delete Item"
                          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredItems.length === 0 && (
            <div className="p-12 text-center">
              <Boxes size={32} className="mx-auto text-muted mb-2 opacity-50" />
              <div className="text-[13px] font-semibold text-ink">No matching products found</div>
              <p className="text-[11px] text-muted mt-1">
                Try adjusting your search keywords, category filter, or add a new product.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] text-muted">
          <span>
            Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> products
          </span>
          <span>Click any product name to view full details & movement history</span>
        </div>
      </div>
    </div>
  );
}
