export interface Item {
  id: number;
  sku: string;
  name: string;
  category: string;
  qty: number;
  min: number;
  cost: number;
  price: number;
  location: string;
  supplier?: string;
  description?: string;
  createdAt: string;
}

export interface SaleLineItem {
  itemId: number;
  itemName: string;
  sku: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface Sale {
  id: string;
  customer: string;
  customerEmail?: string;
  date: string;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  items: SaleLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PurchaseLineItem {
  itemId: number;
  itemName: string;
  sku: string;
  qty: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  supplierEmail?: string;
  date: string;
  status: "Received" | "Pending" | "Cancelled";
  items: PurchaseLineItem[];
  amount: number;
  notes?: string;
}

export interface Movement {
  id: string;
  itemId?: number;
  itemName: string;
  sku?: string;
  type: "sale" | "purchase" | "adjustment" | "created" | "deleted" | "transfer";
  qtyDelta: number;
  reason: string;
  date: string;
  reference?: string;
}

export interface WorkspaceSettings {
  companyName: string;
  ownerName: string;
  currency: string;
  defaultMinStock: number;
  defaultTaxRate: number;
  lowStockAlertsEnabled: boolean;
}

export type Tab = "Overview" | "Stock" | "Sales" | "Purchases" | "Movements" | "Reports" | "Godowns";
