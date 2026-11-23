import { Item, Movement, Purchase, Sale } from "../types";

function escapeCSV(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function downloadCSVFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportItemsToCSV(items: Item[]) {
  const headers = ["ID", "SKU", "Name", "Category", "Quantity", "Min Level", "Unit Cost", "Unit Price", "Location", "Supplier", "Total Value Cost", "Total Value Retail", "Created Date"];
  const rows = items.map((i) => [
    i.id,
    i.sku,
    i.name,
    i.category,
    i.qty,
    i.min,
    i.cost,
    i.price,
    i.location,
    i.supplier || "",
    (i.qty * i.cost).toFixed(2),
    (i.qty * i.price).toFixed(2),
    i.createdAt,
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  downloadCSVFile(csvContent, `inventory_items_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportSalesToCSV(sales: Sale[]) {
  const headers = ["Invoice ID", "Customer", "Date", "Status", "Items Summary", "Subtotal", "Tax", "Discount", "Total Amount", "Payment Method", "Notes"];
  const rows = sales.map((s) => [
    s.id,
    s.customer,
    s.date,
    s.status,
    s.items.map((it) => `${it.itemName} (x${it.qty})`).join("; "),
    s.subtotal.toFixed(2),
    s.tax.toFixed(2),
    s.discount.toFixed(2),
    s.amount.toFixed(2),
    s.paymentMethod || "",
    s.notes || "",
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  downloadCSVFile(csvContent, `sales_invoices_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportPurchasesToCSV(purchases: Purchase[]) {
  const headers = ["PO Number", "Supplier", "Date", "Status", "Items Summary", "Total Amount", "Notes"];
  const rows = purchases.map((p) => [
    p.id,
    p.supplier,
    p.date,
    p.status,
    p.items.map((it) => `${it.itemName} (x${it.qty})`).join("; "),
    p.amount.toFixed(2),
    p.notes || "",
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  downloadCSVFile(csvContent, `purchase_orders_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportMovementsToCSV(movements: Movement[]) {
  const headers = ["ID", "Item Name", "SKU", "Type", "Quantity Change", "Reason", "Date", "Reference"];
  const rows = movements.map((m) => [
    m.id,
    m.itemName,
    m.sku || "",
    m.type,
    m.qtyDelta > 0 ? `+${m.qtyDelta}` : `${m.qtyDelta}`,
    m.reason,
    m.date,
    m.reference || "",
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
  downloadCSVFile(csvContent, `stock_movements_${new Date().toISOString().slice(0, 10)}.csv`);
}
