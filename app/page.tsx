"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Activity,
  BarChart3,
  Settings2,
  Menu,
  X,
  Check,
  Bell,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Item, Movement, Purchase, Sale, Tab, WorkspaceSettings } from "./types";
import { defaultSettings, initialItems, initialMovements, initialPurchases, initialSales } from "./sample-data";
import { loadInitialData, persistAllData, resetAllStorage } from "./lib/storage";

// Modals
import ItemModal from "./components/Modals/ItemModal";
import ItemDetailModal from "./components/Modals/ItemDetailModal";
import AdjustStockModal from "./components/Modals/AdjustStockModal";
import SaleModal from "./components/Modals/SaleModal";
import SaleDetailModal from "./components/Modals/SaleDetailModal";
import PurchaseModal from "./components/Modals/PurchaseModal";
import PurchaseDetailModal from "./components/Modals/PurchaseDetailModal";
import SettingsModal from "./components/Modals/SettingsModal";
import ConfirmDialog from "./components/Modals/ConfirmDialog";

// Tabs
import OverviewTab from "./components/Tabs/OverviewTab";
import StockTab from "./components/Tabs/StockTab";
import SalesTab from "./components/Tabs/SalesTab";
import PurchasesTab from "./components/Tabs/PurchasesTab";
import MovementsTab from "./components/Tabs/MovementsTab";
import ReportsTab from "./components/Tabs/ReportsTab";

export default function StockPilotHome() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("Overview");

  // Main State
  const [items, setItems] = useState<Item[]>(initialItems);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);

  // Modal controls
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const [showItemDetail, setShowItemDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState<Item | null>(null);

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showPurchaseDetail, setShowPurchaseDetail] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // UI state
  const [notice, setNotice] = useState<string>("");
  const [mobileNav, setMobileNav] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    const data = loadInitialData();
    setItems(data.items);
    setSales(data.sales);
    setPurchases(data.purchases);
    setMovements(data.movements);
    setSettings(data.settings);
    setMounted(true);
  }, []);

  // Save changes to localStorage whenever core data changes
  useEffect(() => {
    if (mounted) {
      persistAllData(items, sales, purchases, movements, settings);
    }
  }, [items, sales, purchases, movements, settings, mounted]);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };

  // Low stock calculation
  const lowItems = useMemo(
    () => items.filter((i) => i.qty <= i.min),
    [items]
  );
  const pendingOrdersCount = useMemo(
    () => purchases.filter((p) => p.status === "Pending").length,
    [purchases]
  );
  const pendingSalesCount = useMemo(
    () => sales.filter((s) => s.status === "Pending" || s.status === "Overdue").length,
    [sales]
  );

  // CRUD Handlers - Items
  const handleSaveItem = (itemData: Item) => {
    const exists = items.some((i) => i.id === itemData.id);
    const nowStr =
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    if (exists) {
      setItems((prev) => prev.map((it) => (it.id === itemData.id ? itemData : it)));
      setMovements((prev) => [
        {
          id: `MOV-${Date.now().toString().slice(-4)}`,
          itemId: itemData.id,
          itemName: itemData.name,
          sku: itemData.sku,
          type: "adjustment",
          qtyDelta: 0,
          reason: "Product details updated",
          date: nowStr,
          reference: "Catalog Update",
        },
        ...prev,
      ]);
      toast(`Updated product "${itemData.name}"`);
    } else {
      setItems((prev) => [itemData, ...prev]);
      if (itemData.qty > 0) {
        setMovements((prev) => [
          {
            id: `MOV-${Date.now().toString().slice(-4)}`,
            itemId: itemData.id,
            itemName: itemData.name,
            sku: itemData.sku,
            type: "created",
            qtyDelta: itemData.qty,
            reason: "Initial stock on product creation",
            date: nowStr,
            reference: "Catalog Creation",
          },
          ...prev,
        ]);
      }
      toast(`Added "${itemData.name}" to inventory`);
    }
  };

  const handleDeleteItem = (item: Item) => {
    setConfirmState({
      isOpen: true,
      title: `Delete Product "${item.name}"?`,
      message: `Are you sure you want to remove this item from the catalog? This will delete SKU ${item.sku} and its current ${item.qty} units. This action cannot be undone.`,
      confirmLabel: "Delete Product",
      onConfirm: () => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setMovements((prev) => [
          {
            id: `MOV-${Date.now().toString().slice(-4)}`,
            itemId: item.id,
            itemName: item.name,
            sku: item.sku,
            type: "deleted",
            qtyDelta: -item.qty,
            reason: "Item removed from inventory catalog",
            date:
              new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
              " " +
              new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            reference: "Deletion",
          },
          ...prev,
        ]);
        toast(`Product "${item.name}" was removed`);
      },
    });
  };

  const handleAdjustStock = (itemId: number, newQty: number, movement: Movement) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: newQty } : i))
    );
    setMovements((prev) => [movement, ...prev]);
    toast(`Stock adjusted · Now ${newQty} units for ${movement.itemName}`);
  };

  // CRUD Handlers - Sales
  const handleCreateSale = (
    newSale: Sale,
    saleMovements: Movement[],
    itemUpdates: { id: number; newQty: number }[]
  ) => {
    // Deduct stock
    setItems((prev) =>
      prev.map((it) => {
        const update = itemUpdates.find((u) => u.id === it.id);
        return update ? { ...it, qty: update.newQty } : it;
      })
    );
    setSales((prev) => [newSale, ...prev]);
    setMovements((prev) => [...saleMovements, ...prev]);
    toast(`Invoice ${newSale.id} created · Stock deducted automatically`);
  };

  const handleMarkSalePaid = (saleId: string) => {
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: "Paid" } : s))
    );
    toast(`Invoice ${saleId} marked as Paid`);
  };

  const handleDeleteSale = (sale: Sale) => {
    setConfirmState({
      isOpen: true,
      title: `Cancel & Delete Invoice ${sale.id}?`,
      message: `Do you want to delete invoice ${sale.id} for ${sale.customer}? Note: sold items will be returned to stock inventory.`,
      confirmLabel: "Delete & Restock",
      onConfirm: () => {
        // Return quantities back to items
        setItems((prev) =>
          prev.map((it) => {
            const soldLine = sale.items.find((line) => line.itemId === it.id);
            return soldLine ? { ...it, qty: it.qty + soldLine.qty } : it;
          })
        );
        // Log movement for cancellation
        const nowStr =
          new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
          " " +
          new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        const returnMovements: Movement[] = sale.items.map((line) => ({
          id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          itemId: line.itemId,
          itemName: line.itemName,
          sku: line.sku,
          type: "adjustment",
          qtyDelta: line.qty,
          reason: `Restocked · Invoice ${sale.id} cancelled`,
          date: nowStr,
          reference: sale.id,
        }));

        setMovements((prev) => [...returnMovements, ...prev]);
        setSales((prev) => prev.filter((s) => s.id !== sale.id));
        toast(`Invoice ${sale.id} deleted · Stock returned to inventory`);
      },
    });
  };

  // CRUD Handlers - Purchases
  const handleCreatePurchase = (
    newPurchase: Purchase,
    poMovements: Movement[],
    itemUpdates: { id: number; newQty: number }[]
  ) => {
    if (newPurchase.status === "Received") {
      setItems((prev) =>
        prev.map((it) => {
          const update = itemUpdates.find((u) => u.id === it.id);
          return update ? { ...it, qty: update.newQty } : it;
        })
      );
      setMovements((prev) => [...poMovements, ...prev]);
    }
    setPurchases((prev) => [newPurchase, ...prev]);
    toast(
      newPurchase.status === "Received"
        ? `Purchase order ${newPurchase.id} received · Stock added!`
        : `Purchase order ${newPurchase.id} created (Pending delivery)`
    );
  };

  const handleMarkPurchaseReceived = (purchase: Purchase) => {
    const nowStr =
      new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Group items
    const qtyToAdd = new Map<number, number>();
    for (const line of purchase.items) {
      qtyToAdd.set(line.itemId, (qtyToAdd.get(line.itemId) || 0) + line.qty);
    }

    // Update items stock
    setItems((prev) =>
      prev.map((it) => {
        const added = qtyToAdd.get(it.id);
        return added ? { ...it, qty: it.qty + added } : it;
      })
    );

    // Record movements
    const receivedMovements: Movement[] = purchase.items.map((line) => ({
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: line.itemId,
      itemName: line.itemName,
      sku: line.sku,
      type: "purchase",
      qtyDelta: line.qty,
      reason: `PO received from ${purchase.supplier}`,
      date: nowStr,
      reference: purchase.id,
    }));

    setMovements((prev) => [...receivedMovements, ...prev]);
    setPurchases((prev) =>
      prev.map((p) => (p.id === purchase.id ? { ...p, status: "Received" } : p))
    );

    toast(`PO ${purchase.id} marked as received · All units added to inventory`);
  };

  const handleDeletePurchase = (purchase: Purchase) => {
    setConfirmState({
      isOpen: true,
      title: `Delete Purchase Order ${purchase.id}?`,
      message: `Are you sure you want to remove purchase order ${purchase.id} from ${purchase.supplier}?`,
      confirmLabel: "Delete PO",
      onConfirm: () => {
        setPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
        toast(`Purchase order ${purchase.id} deleted`);
      },
    });
  };

  // Reset to initial demo data
  const handleResetData = () => {
    resetAllStorage();
    setItems(initialItems);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setMovements(initialMovements);
    setSettings(defaultSettings);
    toast("Reset complete: Loaded initial sample inventory & transactions");
  };

  const handleRestoreData = (backup: {
    items: Item[];
    sales: Sale[];
    purchases: Purchase[];
    movements: Movement[];
    settings: WorkspaceSettings;
  }) => {
    if (backup.items) setItems(backup.items);
    if (backup.sales) setSales(backup.sales);
    if (backup.purchases) setPurchases(backup.purchases);
    if (backup.movements) setMovements(backup.movements);
    if (backup.settings) setSettings(backup.settings);
    toast("Backup data restored successfully!");
  };

  const navigationItems = [
    { name: "Overview" as Tab, icon: LayoutDashboard },
    { name: "Stock" as Tab, icon: Boxes, badge: lowItems.length > 0 ? lowItems.length : undefined },
    { name: "Sales" as Tab, icon: ShoppingBag, badge: pendingSalesCount > 0 ? pendingSalesCount : undefined },
    { name: "Purchases" as Tab, icon: ShoppingCart, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { name: "Movements" as Tab, icon: Activity },
    { name: "Reports" as Tab, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-line bg-white transition-transform lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-line px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <Boxes size={20} />
            </div>
            <div>
              <div className="text-[17px] font-extrabold tracking-tight">
                stock<span className="text-brand">pilot</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted">
                INVENTORY PRO
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileNav(false)}
            className="text-muted hover:text-ink lg:hidden p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="px-4 pt-6 space-y-1">
          <div className="mb-2.5 px-3 text-[10px] font-bold tracking-[.18em] text-[#9aa69f] uppercase">
            Workspace
          </div>
          {navigationItems.map((n) => {
            const Icon = n.icon;
            const isActive = tab === n.name;
            return (
              <button
                key={n.name}
                onClick={() => {
                  setTab(n.name);
                  setMobileNav(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-[#eaf4ee] text-brand shadow-xs"
                    : "text-[#65736b] hover:bg-[#f6f8f6] hover:text-ink"
                }`}
              >
                <Icon size={18} className={isActive ? "text-brand" : "text-[#7b8a82]"} />
                <span>{n.name}</span>
                {n.badge !== undefined && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      n.name === "Stock"
                        ? "bg-[#fff0df] text-[#b86c21]"
                        : "bg-[#edf4ff] text-[#2964bd]"
                    }`}
                  >
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Workspace & Settings */}
        <div className="mt-auto p-4 space-y-3">
          <div className="rounded-2xl border border-line bg-[#f5f8f5] p-3.5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-ink">
              <Sparkles size={15} className="text-brand" />
              <span>{settings.companyName}</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              {items.length} products tracked · Real-time auto-sync enabled.
            </p>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[#65736b] hover:bg-[#f6f8f6] hover:text-ink transition"
          >
            <Settings2 size={18} />
            <span>Workspace Settings</span>
          </button>

          <div className="flex items-center gap-3 border-t border-line px-2 pt-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-[12px] font-bold text-brand">
              {settings.ownerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "JD"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-ink">{settings.ownerName}</div>
              <div className="text-[10px] text-muted">Admin Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileNav && (
        <div
          onClick={() => setMobileNav(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col lg:pl-[256px]">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-line bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(true)}
              className="rounded-lg p-2 text-muted hover:bg-canvas lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="text-[11px] font-medium text-muted">
                {settings.companyName} <span className="mx-1">/</span>
                <span className="text-ink font-semibold">{tab}</span>
              </div>
              <div className="text-lg font-bold text-ink">
                {tab === "Overview"
                  ? `Welcome, ${settings.ownerName}`
                  : tab === "Stock"
                  ? "Inventory Catalog"
                  : tab === "Sales"
                  ? "Sales & Invoicing"
                  : tab === "Purchases"
                  ? "Purchase Orders"
                  : tab === "Movements"
                  ? "Stock Movements & Audit Log"
                  : "Analytics & Reports"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action button in header */}
            <button
              onClick={() => {
                if (tab === "Stock") setShowItemModal(true);
                else if (tab === "Sales") setShowSaleModal(true);
                else if (tab === "Purchases") setShowPurchaseModal(true);
                else setShowItemModal(true);
              }}
              className="group hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#176147] px-3.5 py-2 text-[12px] font-bold text-white shadow-[0_2px_8px_rgba(22,101,74,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-emerald-500 hover:to-emerald-700 hover:shadow-[0_4px_14px_rgba(22,101,74,0.35)] active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white shadow-xs group-hover:scale-110 transition-transform">
                <Plus size={13} strokeWidth={2.5} />
              </div>
              <span>
                {tab === "Sales"
                  ? "Record Sale"
                  : tab === "Purchases"
                  ? "New Purchase"
                  : "Add Item"}
              </span>
            </button>

            {/* Notifications button */}
            <button
              onClick={() => {
                if (lowItems.length > 0) {
                  toast(`Alert: ${lowItems.length} items are at or below minimum threshold!`);
                } else {
                  toast("All clear! No pending inventory warnings.");
                }
              }}
              className="relative rounded-xl border border-line bg-white p-2.5 text-muted hover:bg-canvas hover:text-ink transition"
            >
              <Bell size={17} />
              {lowItems.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-5 md:p-8 max-w-[1500px] w-full mx-auto">
          {tab === "Overview" && (
            <OverviewTab
              items={items}
              sales={sales}
              purchases={purchases}
              movements={movements}
              currency={settings.currency}
              onNavigate={setTab}
              onOpenAddItem={() => {
                setItemToEdit(null);
                setShowItemModal(true);
              }}
              onOpenCreateSale={() => setShowSaleModal(true)}
              onOpenNewPurchase={() => setShowPurchaseModal(true)}
              onOpenAdjustStock={() => {
                if (items.length > 0) {
                  setItemToAdjust(items[0]);
                  setShowAdjustModal(true);
                }
              }}
              onSelectSale={(s) => {
                setSelectedSale(s);
                setShowSaleDetail(true);
              }}
              onSelectPurchase={(p) => {
                setSelectedPurchase(p);
                setShowPurchaseDetail(true);
              }}
            />
          )}

          {tab === "Stock" && (
            <StockTab
              items={items}
              currency={settings.currency}
              onAddItem={() => {
                setItemToEdit(null);
                setShowItemModal(true);
              }}
              onViewItem={(item) => {
                setSelectedItem(item);
                setShowItemDetail(true);
              }}
              onEditItem={(item) => {
                setItemToEdit(item);
                setShowItemModal(true);
              }}
              onAdjustItem={(item) => {
                setItemToAdjust(item);
                setShowAdjustModal(true);
              }}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {tab === "Sales" && (
            <SalesTab
              sales={sales}
              currency={settings.currency}
              onCreateSale={() => setShowSaleModal(true)}
              onViewSale={(sale) => {
                setSelectedSale(sale);
                setShowSaleDetail(true);
              }}
              onMarkPaid={handleMarkSalePaid}
              onDeleteSale={handleDeleteSale}
            />
          )}

          {tab === "Purchases" && (
            <PurchasesTab
              purchases={purchases}
              currency={settings.currency}
              onNewPurchase={() => setShowPurchaseModal(true)}
              onViewPurchase={(purchase) => {
                setSelectedPurchase(purchase);
                setShowPurchaseDetail(true);
              }}
              onMarkReceived={handleMarkPurchaseReceived}
              onDeletePurchase={handleDeletePurchase}
            />
          )}

          {tab === "Movements" && <MovementsTab movements={movements} />}

          {tab === "Reports" && (
            <ReportsTab
              items={items}
              sales={sales}
              purchases={purchases}
              currency={settings.currency}
              onNavigateToStock={() => setTab("Stock")}
              onNavigateToPurchases={() => setTab("Purchases")}
            />
          )}
        </main>
      </div>

      {/* --- ALL INTERACTIVE MODALS --- */}

      {/* Add / Edit Item Modal */}
      {showItemModal && (
        <ItemModal
          isOpen={showItemModal}
          onClose={() => {
            setShowItemModal(false);
            setItemToEdit(null);
          }}
          onSave={handleSaveItem}
          existingItem={itemToEdit}
          existingItems={items}
          currency={settings.currency}
        />
      )}

      {/* Item Detail View Modal */}
      {showItemDetail && selectedItem && (
        <ItemDetailModal
          isOpen={showItemDetail}
          item={selectedItem}
          movements={movements}
          currency={settings.currency}
          onClose={() => {
            setShowItemDetail(false);
            setSelectedItem(null);
          }}
          onEdit={(item) => {
            setShowItemDetail(false);
            setItemToEdit(item);
            setShowItemModal(true);
          }}
          onAdjust={(item) => {
            setShowItemDetail(false);
            setItemToAdjust(item);
            setShowAdjustModal(true);
          }}
          onDelete={(item) => {
            setShowItemDetail(false);
            handleDeleteItem(item);
          }}
        />
      )}

      {/* Fast Adjust Stock Modal */}
      {showAdjustModal && itemToAdjust && (
        <AdjustStockModal
          isOpen={showAdjustModal}
          item={itemToAdjust}
          onClose={() => {
            setShowAdjustModal(false);
            setItemToAdjust(null);
          }}
          onAdjust={handleAdjustStock}
        />
      )}

      {/* Create Sale Modal */}
      {showSaleModal && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          items={items}
          currency={settings.currency}
          defaultTaxRate={settings.defaultTaxRate}
          nextInvoiceNum={sales.length + 1090}
          onCreateSale={handleCreateSale}
        />
      )}

      {/* Sale Detail & Invoice Viewer Modal */}
      {showSaleDetail && selectedSale && (
        <SaleDetailModal
          isOpen={showSaleDetail}
          sale={selectedSale}
          currency={settings.currency}
          companyName={settings.companyName}
          onClose={() => {
            setShowSaleDetail(false);
            setSelectedSale(null);
          }}
          onMarkPaid={handleMarkSalePaid}
          onDeleteSale={handleDeleteSale}
        />
      )}

      {/* Create Purchase Order Modal */}
      {showPurchaseModal && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          items={items}
          currency={settings.currency}
          nextPoNum={purchases.length + 422}
          onCreatePurchase={handleCreatePurchase}
        />
      )}

      {/* Purchase Detail Modal */}
      {showPurchaseDetail && selectedPurchase && (
        <PurchaseDetailModal
          isOpen={showPurchaseDetail}
          purchase={selectedPurchase}
          currency={settings.currency}
          onClose={() => {
            setShowPurchaseDetail(false);
            setSelectedPurchase(null);
          }}
          onMarkReceived={handleMarkPurchaseReceived}
          onDeletePurchase={handleDeletePurchase}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          items={items}
          sales={sales}
          purchases={purchases}
          movements={movements}
          onSaveSettings={setSettings}
          onResetData={handleResetData}
          onRestoreData={handleRestoreData}
          toast={toast}
        />
      )}

      {/* Reusable Confirm Dialog */}
      {confirmState.isOpen && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Toast Notification */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#17211d] px-4.5 py-3 text-[12px] font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
            <Check size={13} />
          </div>
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
