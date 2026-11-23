"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  ArrowLeftRight,
  Package,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  MapPin,
  Boxes,
  Truck,
  Plus,
} from "lucide-react";
import { Item, Movement } from "../../types";
import { money } from "../../lib/formatters";

interface GodownsTabProps {
  items: Item[];
  currency: string;
  onTransferStock: (itemId: number, newLocation: string, movement: Movement) => void;
}

export default function GodownsTab({ items, currency, onTransferStock }: GodownsTabProps) {
  const [search, setSearch] = useState("");
  const [selectedGodown, setSelectedGodown] = useState<string>("All");

  // Transfer Modal State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferItemId, setTransferItemId] = useState<number>(items[0]?.id || 1);
  const [transferTargetGodown, setTransferTargetGodown] = useState("Store room - B1");
  const [transferQty, setTransferQty] = useState<number>(1);
  const [transferNote, setTransferNote] = useState("");

  // Standard godowns
  const GODOWNS = [
    {
      id: "Main warehouse - A1",
      name: "Central Godown (Bay A)",
      code: "GD-MAIN-A",
      type: "Primary Fulfillment",
      capacity: 1000,
      manager: "Vikas Sharma",
      color: "#6835f1",
    },
    {
      id: "Store room - B1",
      name: "Regional Godown (Bay B)",
      code: "GD-REG-B",
      type: "Reserve Depot",
      capacity: 500,
      manager: "Pooja Mehta",
      color: "#0ea5e9",
    },
    {
      id: "Retail Display - R1",
      name: "Retail Outlet Depot",
      code: "GD-RET-R1",
      type: "Frontline Outlet",
      capacity: 250,
      manager: "Rahul Verma",
      color: "#10b981",
    },
  ];

  // Group items by godown
  const godownStats = useMemo(() => {
    return GODOWNS.map((g) => {
      const gItems = items.filter((i) => i.location.toLowerCase().includes(g.id.toLowerCase()) || i.location.toLowerCase().includes(g.code.toLowerCase()) || (g.id.includes("Main") && !i.location.includes("Store") && !i.location.includes("Retail")));
      const totalUnits = gItems.reduce((acc, it) => acc + it.qty, 0);
      const totalValuation = gItems.reduce((acc, it) => acc + it.qty * it.price, 0);
      const occupancy = Math.min(100, Math.round((totalUnits / g.capacity) * 100));

      return {
        ...g,
        itemCount: gItems.length,
        totalUnits,
        totalValuation,
        occupancy,
      };
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchesGodown =
        selectedGodown === "All" ||
        item.location.toLowerCase().includes(selectedGodown.toLowerCase());

      return matchesSearch && matchesGodown;
    });
  }, [items, search, selectedGodown]);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const item = items.find((i) => i.id === transferItemId);
    if (!item) return;

    if (transferQty <= 0 || transferQty > item.qty) {
      alert(`Invalid transfer quantity. Available on hand: ${item.qty} units.`);
      return;
    }

    const movement: Movement = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      type: "transfer",
      qtyDelta: transferQty,
      reason: transferNote ? `Transfer: ${transferNote}` : `Inter-godown transfer to ${transferTargetGodown}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      reference: `From: ${item.location} -> To: ${transferTargetGodown}`,
    };

    onTransferStock(item.id, transferTargetGodown, movement);
    setIsTransferOpen(false);
    setTransferNote("");
  };

  return (
    <div className="space-y-6">
      {/* Heading & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-brand">
            MULTI-LOCATION LOGISTICS
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#141031]">
            Godown & Warehouse View
          </h1>
          <p className="mt-1 text-[12px] text-muted font-medium">
            Manage multi-site godown stock levels, track warehouse capacity, and execute internal stock transfers.
          </p>
        </div>

        <button
          onClick={() => setIsTransferOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#4f46e5] px-4.5 py-2.5 text-[12px] font-bold text-white shadow-purple hover:shadow-[0_20px_45px_-5px_rgba(99,102,241,0.5)] active:scale-[0.98] transition cursor-pointer"
        >
          <ArrowLeftRight size={15} /> Transfer Stock Between Godowns
        </button>
      </div>

      {/* Godown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {godownStats.map((godown) => (
          <div
            key={godown.id}
            onClick={() => setSelectedGodown(selectedGodown === godown.id ? "All" : godown.id)}
            className={`cursor-pointer rounded-[28px] border p-6 transition duration-200 hover:-translate-y-1 shadow-[0_12px_32px_rgba(95,45,235,0.06)] flex flex-col justify-between ${
              selectedGodown === godown.id
                ? "border-[#6835f1] ring-2 ring-[#6835f1]/20 bg-[#fafaff]"
                : "border-[#e8ebf7] bg-white hover:border-[#6835f1]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line"
                  style={{ backgroundColor: `${godown.color}15`, color: godown.color }}
                >
                  <Building2 size={20} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-muted">
                  {godown.code}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-black text-[#141031] tracking-tight">{godown.name}</h3>
                <span className="text-[11px] font-semibold text-muted">{godown.type}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#f0f2fa] pt-3 text-[12px]">
                <div>
                  <span className="text-muted text-[11px]">Units Stored</span>
                  <div className="font-black text-[#141031] text-lg">{godown.totalUnits}</div>
                </div>
                <div>
                  <span className="text-muted text-[11px]">Godown Value</span>
                  <div className="font-black text-[#141031] text-lg">
                    {money(godown.totalValuation, currency)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted mb-1.5">
                <span>Capacity Utilized</span>
                <span style={{ color: godown.color }}>{godown.occupancy}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f0f2fa] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${godown.occupancy}%`, backgroundColor: godown.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8ebf7] bg-white p-3 shadow-soft">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-[#edeef6] bg-[#f8f9fe] px-3.5 py-2">
          <Search size={15} className="text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name, SKU, or godown rack..."
            className="w-full bg-transparent text-[12px] font-semibold text-[#141031] outline-none placeholder:text-muted/70"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#edeef6] bg-[#f8f9fe] px-3 py-2 text-[12px] font-bold text-[#141031]">
            <Filter size={13} className="text-muted" />
            <select
              value={selectedGodown}
              onChange={(e) => setSelectedGodown(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[12px]"
            >
              <option value="All">All Godowns</option>
              <option value="Main warehouse">Central Godown (Bay A)</option>
              <option value="Store room">Regional Godown (Bay B)</option>
              <option value="Retail Display">Retail Outlet Depot</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items in Selected Godown Table */}
      <div className="overflow-hidden rounded-[28px] border border-[#e8ebf7] bg-white p-6 shadow-[0_12px_32px_rgba(95,45,235,0.06)]">
        <h3 className="mb-4 text-base font-extrabold text-[#141031]">
          Inventory Allocated in {selectedGodown === "All" ? "All Godowns" : selectedGodown}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#f0f2fa] text-[11px] font-bold uppercase tracking-wider text-muted">
                <th className="pb-3 px-3">Product Name</th>
                <th className="pb-3 px-3">SKU</th>
                <th className="pb-3 px-3">Godown Bay / Location</th>
                <th className="pb-3 px-3 text-right">Units on Hand</th>
                <th className="pb-3 px-3 text-right">Total Value</th>
                <th className="pb-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6fc]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8f9fe] transition">
                  <td className="py-3 px-3 font-bold text-[#141031]">{item.name}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-muted font-bold">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-[#6835f1]">
                      <MapPin size={11} /> {item.location}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-[#141031]">{item.qty}</td>
                  <td className="py-3 px-3 text-right font-bold text-[#141031]">
                    {money(item.qty * item.price, currency)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        setTransferItemId(item.id);
                        setIsTransferOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-[#6835f1] hover:bg-[#f3f5fd] shadow-xs transition"
                    >
                      <ArrowLeftRight size={12} /> Transfer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inter-Godown Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-[#6835f1]">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#141031]">Transfer Stock</h3>
                  <p className="text-[11px] text-muted">Inter-godown stock movement</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="rounded-full p-1 text-muted hover:bg-canvas"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-[12px]">
              <div>
                <label className="font-bold text-[#141031]">Select Product to Move</label>
                <select
                  value={transferItemId}
                  onChange={(e) => setTransferItemId(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-line bg-white p-2.5 font-semibold text-[#141031] outline-none"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.sku}) — Available: {it.qty} in {it.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#141031]">Destination Godown</label>
                <select
                  value={transferTargetGodown}
                  onChange={(e) => setTransferTargetGodown(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-line bg-white p-2.5 font-semibold text-[#141031] outline-none"
                >
                  <option value="Main warehouse - A1">Central Godown (Bay A)</option>
                  <option value="Store room - B1">Regional Godown (Bay B)</option>
                  <option value="Retail Display - R1">Retail Outlet Depot</option>
                  <option value="Backroom - Shelf 3">Overflow Reserve Godown</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#141031]">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={items.find((i) => i.id === transferItemId)?.qty || 1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="mt-1 w-full rounded-2xl border border-line bg-white p-2.5 font-semibold text-[#141031] outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#141031]">Transfer Note / Gate Pass #</label>
                <input
                  type="text"
                  placeholder="e.g. Stock rebalancing for peak sales demand"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-line bg-white p-2.5 font-semibold text-[#141031] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="rounded-2xl border border-line px-4 py-2 font-bold text-muted hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#6835f1] px-5 py-2 font-bold text-white shadow-purple hover:bg-[#5828d9] transition"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
