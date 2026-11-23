import { Item, Movement, Purchase, Sale, WorkspaceSettings } from "../types";
import { defaultSettings, initialItems, initialMovements, initialPurchases, initialSales } from "../sample-data";

const STORAGE_KEYS = {
  ITEMS: "stockpilot_items_v2",
  SALES: "stockpilot_sales_v2",
  PURCHASES: "stockpilot_purchases_v2",
  MOVEMENTS: "stockpilot_movements_v2",
  SETTINGS: "stockpilot_settings_v2",
};

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error loading key ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to storage:`, e);
  }
}

export function loadInitialData() {
  return {
    items: loadFromStorage<Item[]>(STORAGE_KEYS.ITEMS, initialItems),
    sales: loadFromStorage<Sale[]>(STORAGE_KEYS.SALES, initialSales),
    purchases: loadFromStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, initialPurchases),
    movements: loadFromStorage<Movement[]>(STORAGE_KEYS.MOVEMENTS, initialMovements),
    settings: loadFromStorage<WorkspaceSettings>(STORAGE_KEYS.SETTINGS, defaultSettings),
  };
}

export function persistAllData(
  items: Item[],
  sales: Sale[],
  purchases: Purchase[],
  movements: Movement[],
  settings: WorkspaceSettings
) {
  saveToStorage(STORAGE_KEYS.ITEMS, items);
  saveToStorage(STORAGE_KEYS.SALES, sales);
  saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
  saveToStorage(STORAGE_KEYS.MOVEMENTS, movements);
  saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

export function resetAllStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.SALES);
  localStorage.removeItem(STORAGE_KEYS.PURCHASES);
  localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
