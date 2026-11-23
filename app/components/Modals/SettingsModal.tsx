"use client";

import React, { useRef, useState } from "react";
import { X, Save, Download, Upload, RotateCcw, ShieldAlert, Check } from "lucide-react";
import { Item, Movement, Purchase, Sale, WorkspaceSettings } from "../../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WorkspaceSettings;
  items: Item[];
  sales: Sale[];
  purchases: Purchase[];
  movements: Movement[];
  onSaveSettings: (settings: WorkspaceSettings) => void;
  onResetData: () => void;
  onRestoreData: (backup: {
    items: Item[];
    sales: Sale[];
    purchases: Purchase[];
    movements: Movement[];
    settings: WorkspaceSettings;
  }) => void;
  toast: (msg: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  items,
  sales,
  purchases,
  movements,
  onSaveSettings,
  onResetData,
  onRestoreData,
  toast,
}: SettingsModalProps) {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultMinStock, setDefaultMinStock] = useState(String(settings.defaultMinStock));
  const [defaultTaxRate, setDefaultTaxRate] = useState(String(settings.defaultTaxRate));
  const [lowStockAlertsEnabled, setLowStockAlertsEnabled] = useState(settings.lowStockAlertsEnabled);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      companyName: companyName.trim() || "StockPilot Co.",
      ownerName: ownerName.trim() || "Jordan Davis",
      currency,
      defaultMinStock: parseInt(defaultMinStock) || 10,
      defaultTaxRate: parseFloat(defaultTaxRate) || 0,
      lowStockAlertsEnabled,
    });
    toast("Settings updated successfully!");
    onClose();
  };

  const handleExportBackup = () => {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      settings: {
        companyName,
        ownerName,
        currency,
        defaultMinStock: parseInt(defaultMinStock) || 10,
        defaultTaxRate: parseFloat(defaultTaxRate) || 0,
        lowStockAlertsEnabled,
      },
      items,
      sales,
      purchases,
      movements,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockpilot_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("JSON Backup exported successfully!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.items && Array.isArray(json.items)) {
          onRestoreData(json);
          toast("Backup data restored successfully!");
          onClose();
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to read JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
              Configuration
            </span>
            <h2 className="text-lg font-bold text-ink">Workspace Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Company Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">
                Workspace Owner / User
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[12px] outline-none focus:border-brand focus:bg-white font-semibold"
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="¥">¥ (JPY / CNY)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Default Min Qty</label>
              <input
                type="number"
                min="1"
                value={defaultMinStock}
                onChange={(e) => setDefaultMinStock(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(e.target.value)}
                className="w-full rounded-xl border border-line bg-canvas/40 px-3 py-2 text-[12px] outline-none focus:border-brand focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line p-3 bg-canvas/40">
            <div>
              <div className="text-[12px] font-semibold text-ink">Low Stock Alerts</div>
              <div className="text-[10px] text-muted">Show warning badges when stock ≤ min level</div>
            </div>
            <input
              type="checkbox"
              checked={lowStockAlertsEnabled}
              onChange={(e) => setLowStockAlertsEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
            />
          </div>

          {/* Backup & Restore Data section */}
          <div className="rounded-xl border border-line p-4 space-y-3 bg-[#fafbfa]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink">
              Data Management & Backup
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              All inventory, sales, purchases, and audit movements are stored securely in your browser&apos;s
              localStorage. You can export a full backup or restore anytime.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-canvas shadow-xs"
              >
                <Download size={13} /> Export Backup (JSON)
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-ink hover:bg-canvas shadow-xs"
              >
                <Upload size={13} /> Restore Backup (JSON)
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>

            <div className="border-t border-line pt-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-red-600">Reset Demo Data</div>
                <div className="text-[10px] text-muted">
                  Restore original clean demo items, sales, and purchases
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to reset all data to default demo state?")) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2 text-[12px] font-semibold text-muted hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-[#185940]"
            >
              <Save size={14} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
