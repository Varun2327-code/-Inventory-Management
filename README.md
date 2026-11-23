# StockPilot — Production-Grade Inventory Management System

A fully-featured, reactive inventory management workspace built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## 🚀 Key Features & Capabilities

### 1. 📦 Complete Inventory & Product Management
- **Add New Products**: Full form with automated SKU generation helper (`EL-XXXX`, `OF-XXXX`, etc.), category selector, cost price, selling price, min reorder threshold, storage location, and vendor notes.
- **Edit & Delete Items**: Modify details or safely delete products with confirmation dialogs.
- **Quick Stock Adjustment**: Fast `+` (Restock / Return), `-` (Damaged / Offline sale), or `=` (Inventory Recount / Audit) adjustments with reason logging.
- **Deep Item Detail Modal**: View stock status, gross profit margin %, total inventory asset value, retail potential, and item-specific movement history.
- **Advanced Filtering & Sorting**: Filter by category, stock availability (In Stock, Low Stock, Out of Stock), and sort by name, quantity, asset value, or price.

### 2. 🧾 Real Sales Invoicing & Stock Deduction
- **Multi-Item Invoices**: Add multiple line items to an order with real-time stock limits (prevents overselling beyond warehouse quantity).
- **Automated Price & Tax Calculation**: Subtotal, custom tax rate %, discount $, and grand total calculation.
- **Direct Stock Deduction**: Automatically deducts exact units from warehouse inventory when an invoice is issued.
- **Commercial Tax Invoice Viewer**: Branded printable invoice modal (`Print / Save as PDF`), payment method tracking, and status controls (`Paid`, `Pending`, `Overdue`).
- **Invoice Cancellation & Restock**: Cancel or delete an invoice to automatically restore reserved stock to inventory.

### 3. 🚚 Procurement & Purchase Orders
- **Multi-Item Purchase Orders**: Order multiple products from suppliers with custom unit costs and quantities.
- **Automated Restocking Workflow**: When a PO is marked as **Received**, units are automatically added to the matching inventory products and logged in the audit trail.
- **Pending Deliveries Tracking**: Monitor inbound shipments and supplier contact information.

### 4. 📋 Dynamic Stock Movement Log & Audit Trail
- **Automated Chronological Journal**: Every sale, purchase order receipt, manual adjustment, new product addition, or deletion is recorded with timestamp, delta (`+`/`-`), reason, and reference ID.
- **Operation Filter**: Filter audit events by Sales, Purchases, Adjustments, Creations, and Deletions.

### 5. 📊 Business Intelligence & Financial Reports
- **Financial Performance**: Sales Revenue, Cost of Goods Sold (COGS), Gross Profit, and Gross Margin %.
- **Inventory Valuation**: Capital invested at cost vs. potential retail valuation and unrealized profit.
- **Category Capital Distribution**: Visual progress bars showing capital allocation per category.
- **Low Stock Reorder Planner**: Automatic calculation of suggested reorder quantities for items at or below minimum threshold.

### 6. 💾 Offline-First Persistence & Portability
- **LocalStorage Auto-Sync**: State persists across browser refreshes and tabs.
- **JSON Backup Export & Restore**: Export full workspace backup file or restore from JSON.
- **Sample Data Reset**: One-click restore to sample demo catalog anytime from Workspace Settings.
- **CSV Data Export**: Instant download of CSV spreadsheets for Inventory Catalog, Sales Invoices, Purchase Orders, and Stock Movements.

### 7. ⚙️ Workspace Customization
- **Currency Switcher**: Support for `$`, `€`, `£`, `₹`, and `¥`.
- **Company Branding**: Set workspace company name and administrator manager profile.
- **Low Stock Alerts**: Customizable threshold and toggleable notification badges.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ installed

### Run Locally
```bash
cd stockpilot-inventory
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```
