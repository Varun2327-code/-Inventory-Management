"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Plus,
  ShoppingCart,
  ShoppingBag,
  Sliders,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react";
import { Item, Movement, Purchase, Sale, WorkspaceSettings } from "./types";
import { defaultSettings, initialItems, initialMovements, initialPurchases, initialSales } from "./sample-data";
import { loadInitialData, persistAllData, resetAllStorage } from "./lib/storage";
import { money } from "./lib/formatters";

// Dashboard Components
import Sidebar, { NavItemKey } from "./components/Dashboard/Sidebar";
import Header from "./components/Dashboard/Header";
import BillsSection from "./components/Dashboard/BillsSection";
import InvoicesSection from "./components/Dashboard/InvoicesSection";
import LowStockAlerts from "./components/Dashboard/LowStockAlerts";
import HistorySection from "./components/Dashboard/HistorySection";

// Full Module Tabs
import StockTab from "./components/Tabs/StockTab";
import SalesTab from "./components/Tabs/SalesTab";
import PurchasesTab from "./components/Tabs/PurchasesTab";
import GodownsTab from "./components/Tabs/GodownsTab";
import ReportsTab from "./components/Tabs/ReportsTab";
import MovementsTab from "./components/Tabs/MovementsTab";

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

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState<NavItemKey>("dashboard");

  // Core Persistent State
  const [items, setItems] = useState<Item[]>(initialItems);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [movements, setMovements] = useState<Movement[]>(initialMovements);
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);

  // Modals
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

  // Confirmation dialog
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

  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    const data = loadInitialData();
    setItems(data.items);
    setSales(data.sales);
    setPurchases(data.purchases);
    setMovements(data.movements);
    setSettings(data.settings);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      persistAllData(items, sales, purchases, movements, settings);
    }
  }, [items, sales, purchases, movements, settings, mounted]);

  const toast = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const handleNavSelect = (key: NavItemKey) => {
    if (key === "settings") {
      setShowSettingsModal(true);
    } else {
      setActiveNav(key);
    }
  };

  // Live Computed Metrics
  const totalUnitsOnHand = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );
  const totalStockCost = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.cost, 0),
    [items]
  );
  const totalStockRetail = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );
  const totalSalesRevenue = useMemo(
    () => sales.reduce((sum, s) => (s.status !== "Cancelled" ? sum + s.amount : sum), 0),
    [sales]
  );
  const paidSales = useMemo(() => sales.filter((s) => s.status === "Paid"), [sales]);
  const paidAmount = useMemo(
    () => paidSales.reduce((sum, s) => sum + s.amount, 0),
    [paidSales]
  );
  const lowItems = useMemo(() => items.filter((i) => i.qty <= i.min), [items]);
  const pendingPurchases = useMemo(
    () => purchases.filter((p) => p.status === "Pending"),
    [purchases]
  );
  const pendingPurchasesAmount = useMemo(
    () => pendingPurchases.reduce((sum, p) => sum + p.amount, 0),
    [pendingPurchases]
  );

  // Dynamic health score: percentage of healthy SKUs or fulfillment score
  const fulfillmentHealth = useMemo(() => {
    if (items.length === 0) return 0;
    const healthyCount = items.length - lowItems.length;
    const ratio = Math.round((healthyCount / items.length) * 100);
    return Math.min(95, Math.max(30, ratio));
  }, [items, lowItems]);

  // CRUD Handlers
  const handleSaveItem = (itemData: Item) => {
    const exists = items.some((i) => i.id === itemData.id);

    if (exists) {
      setItems((prev) => prev.map((it) => (it.id === itemData.id ? itemData : it)));
      toast(`Updated product "${itemData.name}"`);
    } else {
      setItems((prev) => [itemData, ...prev]);
      const newMovement: Movement = {
        id: `MOV-${Date.now().toString().slice(-4)}`,
        itemId: itemData.id,
        itemName: itemData.name,
        sku: itemData.sku,
        type: "created",
        qtyDelta: itemData.qty,
        reason: "Initial stock catalog registration",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setMovements((prev) => [newMovement, ...prev]);
      toast(`Added "${itemData.name}" to inventory`);
    }
  };

  const handleDeleteItem = (item: Item) => {
    setConfirmState({
      isOpen: true,
      title: `Delete Product "${item.name}"?`,
      message: `Are you sure you want to remove this item from the catalog? This will delete SKU ${item.sku}.`,
      confirmLabel: "Delete Product",
      onConfirm: () => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        const delMovement: Movement = {
          id: `MOV-${Date.now().toString().slice(-4)}`,
          itemName: item.name,
          sku: item.sku,
          type: "deleted",
          qtyDelta: -item.qty,
          reason: `Product deleted from catalog`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
        setMovements((prev) => [delMovement, ...prev]);
        toast(`Product "${item.name}" was removed`);
      },
    });
  };

  const handleAdjustStock = (itemId: number, newQty: number, movement: Movement) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: newQty } : i))
    );
    setMovements((prev) => [movement, ...prev]);
    toast(`Stock adjusted · Now ${newQty} units`);
  };

  // Connected Workflow: Sale reduces stock!
  const handleCreateSale = (
    newSale: Sale,
    saleMovements: Movement[],
    itemUpdates: { id: number; newQty: number }[]
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        const update = itemUpdates.find((u) => u.id === it.id);
        return update ? { ...it, qty: update.newQty } : it;
      })
    );
    setSales((prev) => [newSale, ...prev]);
    setMovements((prev) => [...saleMovements, ...prev]);
    toast(`Invoice ${newSale.id} created · Stock reduced automatically`);
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
      message: `Do you want to delete invoice ${sale.id}?`,
      confirmLabel: "Delete Invoice",
      onConfirm: () => {
        setSales((prev) => prev.filter((s) => s.id !== sale.id));
        toast(`Invoice ${sale.id} deleted`);
      },
    });
  };

  // Connected Workflow: Purchase creates/increases stock!
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
      toast(`PO ${newPurchase.id} received · Stock added to warehouse`);
    } else {
      toast(`PO ${newPurchase.id} created as Pending shipment`);
    }
    setPurchases((prev) => [newPurchase, ...prev]);
  };

  // Connected Workflow: Marking PO received increases stock!
  const handleMarkPurchaseReceived = (purchase: Purchase) => {
    const poDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const poMovements: Movement[] = purchase.items.map((line) => ({
      id: `MOV-${Date.now().toString().slice(-4)}-${line.itemId}`,
      itemId: line.itemId,
      itemName: line.itemName,
      sku: line.sku,
      type: "purchase",
      qtyDelta: line.qty,
      reason: `Received PO ${purchase.id} from ${purchase.supplier}`,
      date: poDate,
      reference: purchase.id,
    }));

    setItems((prev) =>
      prev.map((it) => {
        const line = purchase.items.find((p) => p.itemId === it.id);
        return line ? { ...it, qty: it.qty + line.qty } : it;
      })
    );

    setPurchases((prev) =>
      prev.map((p) => (p.id === purchase.id ? { ...p, status: "Received" } : p))
    );

    setMovements((prev) => [...poMovements, ...prev]);
    toast(`PO ${purchase.id} marked as Received · Stock increased`);
  };

  const handleDeletePurchase = (purchase: Purchase) => {
    setConfirmState({
      isOpen: true,
      title: `Delete Purchase Order ${purchase.id}?`,
      message: `Are you sure you want to remove PO ${purchase.id}?`,
      confirmLabel: "Delete PO",
      onConfirm: () => {
        setPurchases((prev) => prev.filter((p) => p.id !== purchase.id));
        toast(`PO ${purchase.id} deleted`);
      },
    });
  };

  // Connected Workflow: Godown Transfer
  const handleTransferStock = (itemId: number, newLocation: string, movement: Movement) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, location: newLocation } : i))
    );
    setMovements((prev) => [movement, ...prev]);
    toast(`Transferred stock to "${newLocation}"`);
  };

  const handleResetData = () => {
    resetAllStorage();
    setItems(initialItems);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setMovements(initialMovements);
    setSettings(defaultSettings);
    toast("Reset complete: default sample data reloaded");
  };

  return (
    <div className="min-h-screen bg-[#f1f3fa] text-[#141031] flex antialiased">
      {/* A. Fixed Left Sidebar with all modules & badges */}
      <Sidebar
        activeItem={activeNav}
        onSelect={handleNavSelect}
        lowStockCount={lowItems.length}
        pendingPurchasesCount={pendingPurchases.length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 min-h-screen pl-[88px] flex flex-col">
        <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-9 py-6 sm:py-8 space-y-7 pb-24">
          {/* Top Header */}
          <Header onSearch={(q) => console.log("Searching:", q)} />

          {/* Quick Operations Station (Instant workflow triggers) */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#e8ebf7] bg-white p-3.5 sm:p-4 shadow-[0_8px_24px_rgba(95,45,235,0.04)]">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] font-extrabold text-[#141031]">
                {settings.companyName}
              </span>
              <span className="text-muted text-[11px] font-medium hidden sm:inline">
                · {items.length} SKUs · {totalUnitsOnHand} Units in Godowns
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setItemToEdit(null);
                  setShowItemModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-[#141031] shadow-xs hover:bg-[#f8f9fe] hover:border-[#6835f1]/40 transition cursor-pointer"
              >
                <Plus size={13} className="text-[#6835f1]" />
                <span>Add Product</span>
              </button>

              <button
                onClick={() => setShowPurchaseModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-[#141031] shadow-xs hover:bg-[#f8f9fe] hover:border-indigo-400 transition cursor-pointer"
              >
                <ShoppingCart size={13} className="text-indigo-600" />
                <span>New Purchase</span>
              </button>

              <button
                onClick={() => {
                  if (items.length > 0) {
                    setItemToAdjust(items[0]);
                    setShowAdjustModal(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-[#141031] shadow-xs hover:bg-[#f8f9fe] hover:border-amber-400 transition cursor-pointer"
              >
                <Sliders size={13} className="text-amber-600" />
                <span>Adjust Stock</span>
              </button>

              <button
                onClick={() => setActiveNav("godowns")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[11px] font-bold text-[#141031] shadow-xs hover:bg-[#f8f9fe] hover:border-sky-400 transition cursor-pointer"
              >
                <ArrowLeftRight size={13} className="text-sky-600" />
                <span>Godown Transfer</span>
              </button>

              <button
                onClick={() => setShowSaleModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#4f46e5] px-4 py-1.5 text-[11px] font-bold text-white shadow-purple hover:shadow-[0_12px_28px_rgba(99,102,241,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag size={13} />
                <span>Record Sale</span>
              </button>
            </div>
          </div>

          {/* MODULE 1: DASHBOARD */}
          {activeNav === "dashboard" && (
            <>
              {/* Bills Section with Live Values */}
              <BillsSection
                totalUnits={totalUnitsOnHand}
                activeSkus={items.length}
                salesCount={sales.length}
                salesRevenue={money(totalSalesRevenue, settings.currency)}
                lowStockCount={lowItems.length}
                pendingPurchasesCount={pendingPurchases.length}
                pendingPurchasesAmount={money(pendingPurchasesAmount, settings.currency)}
              />

              {/* Invoices Section with Live Valuation & Speedometer */}
              <InvoicesSection
                healthPercentage={fulfillmentHealth}
                inventoryValuation={money(totalStockRetail, settings.currency)}
                inventoryCostBasis={money(totalStockCost, settings.currency)}
                paidAmount={money(paidAmount, settings.currency)}
                liveJobsValue={money(totalSalesRevenue, settings.currency)}
              />

              {/* Low Stock Alerts Module */}
              <LowStockAlerts
                lowItems={lowItems}
                onOrderStock={(item) => {
                  setShowPurchaseModal(true);
                }}
                onAdjustStock={(item) => {
                  setItemToAdjust(item);
                  setShowAdjustModal(true);
                }}
              />

              {/* Recent Activity / History Section with Live Feed */}
              <HistorySection
                movements={movements}
                sales={sales}
                currency={settings.currency}
                onViewAllActivity={() => setActiveNav("movements")}
              />
            </>
          )}

          {/* MODULE 4: STOCK & CATALOG */}
          {activeNav === "stock" && (
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

          {/* MODULE 2: SALES & INVOICES */}
          {activeNav === "sales" && (
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

          {/* MODULE 3: PURCHASES & SUPPLY CHAIN */}
          {activeNav === "purchases" && (
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

          {/* BONUS MODULE: GODOWNS & WAREHOUSES */}
          {activeNav === "godowns" && (
            <GodownsTab
              items={items}
              currency={settings.currency}
              onTransferStock={handleTransferStock}
            />
          )}

          {/* MODULE 5: REPORTS & BUSINESS INTELLIGENCE */}
          {activeNav === "reports" && (
            <ReportsTab
              items={items}
              sales={sales}
              purchases={purchases}
              currency={settings.currency}
              onNavigateToStock={() => setActiveNav("stock")}
              onNavigateToPurchases={() => setActiveNav("purchases")}
            />
          )}

          {/* AUDIT TRAIL / ACTIVITY LOG */}
          {activeNav === "movements" && <MovementsTab movements={movements} />}
        </main>
      </div>

      {/* --- MODALS --- */}
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
          onRestoreData={(b) => {
            if (b.items) setItems(b.items);
            if (b.sales) setSales(b.sales);
            if (b.purchases) setPurchases(b.purchases);
            if (b.movements) setMovements(b.movements);
            if (b.settings) setSettings(b.settings);
            toast("Data restored");
          }}
          toast={toast}
        />
      )}

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

      {/* Interactive Toast notification */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#1d173c] px-4.5 py-3 text-[12px] font-bold text-white shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6835f1] text-white">
            <Check size={13} strokeWidth={3} />
          </div>
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
