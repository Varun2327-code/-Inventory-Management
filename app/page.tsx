"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Item, Movement, Purchase, Sale, WorkspaceSettings } from "./types";
import { defaultSettings, initialItems, initialMovements, initialPurchases, initialSales } from "./sample-data";
import { loadInitialData, persistAllData, resetAllStorage } from "./lib/storage";

// Dashboard Components matching reference screenshot
import Sidebar, { NavItemKey } from "./components/Dashboard/Sidebar";
import Header from "./components/Dashboard/Header";
import BillsSection from "./components/Dashboard/BillsSection";
import InvoicesSection from "./components/Dashboard/InvoicesSection";
import HistorySection from "./components/Dashboard/HistorySection";

// Existing Full Tabs (for other sidebar views)
import StockTab from "./components/Tabs/StockTab";
import SalesTab from "./components/Tabs/SalesTab";
import PurchasesTab from "./components/Tabs/PurchasesTab";
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
    window.setTimeout(() => setNotice(""), 3200);
  };

  const handleNavSelect = (key: NavItemKey) => {
    if (key === "settings") {
      setShowSettingsModal(true);
    } else {
      setActiveNav(key);
    }
  };

  // CRUD Handlers
  const handleSaveItem = (itemData: Item) => {
    const exists = items.some((i) => i.id === itemData.id);

    if (exists) {
      setItems((prev) => prev.map((it) => (it.id === itemData.id ? itemData : it)));
      toast(`Updated product "${itemData.name}"`);
    } else {
      setItems((prev) => [itemData, ...prev]);
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
    toast(`Invoice ${newSale.id} created successfully`);
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
    toast(`PO ${newPurchase.id} created`);
  };

  const handleMarkPurchaseReceived = (purchase: Purchase) => {
    setPurchases((prev) =>
      prev.map((p) => (p.id === purchase.id ? { ...p, status: "Received" } : p))
    );
    toast(`PO ${purchase.id} marked as Received`);
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
      {/* A. Fixed Left Sidebar */}
      <Sidebar activeItem={activeNav} onSelect={handleNavSelect} />

      {/* Main Layout Area with generous bottom padding so History section is fully visible */}
      <div className="flex-1 min-h-screen pl-[88px] flex flex-col">
        <main className="mx-auto w-full max-w-[1440px] px-5 sm:px-9 py-6 sm:py-8 space-y-7 pb-24">
          {/* B. Top Header */}
          <Header onSearch={(q) => console.log("Searching:", q)} />

          {/* Conditional View: Dashboard vs Other tabs */}
          {activeNav === "dashboard" && (
            <>
              {/* C. Bills Section */}
              <BillsSection />

              {/* D. Invoices Section (Aligned 4-column layout) */}
              <InvoicesSection />

              {/* E. History Section */}
              <HistorySection />
            </>
          )}

          {activeNav === "analytics" && (
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

          {activeNav === "documents" && (
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

          {activeNav === "users" && (
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

          {activeNav === "messages" && <MovementsTab movements={movements} />}
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
