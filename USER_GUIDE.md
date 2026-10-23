# 🥐 BakeryPOS — Complete System Overview & Customer User Manual

> **Welcome to BakeryPOS!**  
> This comprehensive manual serves as both the **complete project explanation** and the **official user guidance handbook** for shop owners, managers, and counter cashiers. Whether you are getting clarification on how the software works or training counter staff, this single guide covers every feature, workflow, and setting in clear, step-by-step detail.

---

## 📑 Table of Contents

1. [Executive Summary & Project Overview](#1-executive-summary--project-overview)
2. [Why BakeryPOS? Core Benefits for Bakeries](#2-why-bakerypos-core-benefits-for-bakeries)
3. [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
4. [Online vs. Offline Capabilities (100% Offline-Ready)](#4-online-vs-offline-capabilities-100-offline-ready)
5. [Hardware & Peripheral Setup](#5-hardware--peripheral-setup)
6. [Getting Started: Launch & Desktop / Tablet App Installation (PWA)](#6-getting-started-launch--desktop--tablet-app-installation-pwa)
7. [User Accounts, Roles & Password Management](#7-user-accounts-roles--password-management)
8. [Module 1: High-Speed POS Counter Billing (Step-by-Step)](#8-module-1-high-speed-pos-counter-billing-step-by-step)
9. [Module 2: Thermal Receipt Printing & A4 Tax Invoices](#9-module-2-thermal-receipt-printing--a4-tax-invoices)
10. [Module 3: Product Catalog & Menu Management](#10-module-3-product-catalog--menu-management)
11. [Module 4: Live Inventory Control & Stock Audit Logs](#11-module-4-live-inventory-control--stock-audit-logs)
12. [Module 5: Customer Directory & Loyalty Records](#12-module-5-customer-directory--loyalty-records)
13. [Module 6: Sales Bills & Invoices History](#13-module-6-sales-bills--invoices-history)
14. [Module 7: Executive Analytics & Sales Dashboard](#14-module-7-executive-analytics--sales-dashboard)
15. [Module 8: Staff & Cashier User Administration](#15-module-8-staff--cashier-user-administration)
16. [Module 9: Shop & Invoicing Configuration (Store Settings)](#16-module-9-shop--invoicing-configuration-store-settings)
17. [Daily Operational Checklist for Cashiers & Store Managers](#17-daily-operational-checklist-for-cashiers--store-managers)
18. [Data Safety, Backup & Disaster Recovery Guide](#18-data-safety-backup--disaster-recovery-guide)
19. [Frequently Asked Questions (FAQ) & Troubleshooting](#19-frequently-asked-questions-faq--troubleshooting)
20. [Summary & Quick Reference Cheat Sheet](#20-summary--quick-reference-cheat-sheet)

---

## 1. Executive Summary & Project Overview

**BakeryPOS** is a modern, enterprise-grade Point of Sale (POS) and retail management application designed specifically for **retail bakeries, pastry shops, cake studios, cafes, and confectioneries**.

Modern bakeries face unique operational challenges that generic retail software fails to handle:
- Selling items both by **exact piece counts** (puffs, cupcakes, buns) and by **decimal weights** (custom cakes by 0.75 kg, cookies by 250 gm).
- Extreme morning and evening counter rush hours requiring **sub-second search and checkout**.
- Unreliable retail internet connectivity requiring **100% offline-independent billing**.
- The need for **instant thermal receipt printing (80mm & 58mm)** with barcode and tax summaries.
- Strict inventory deduction to avoid stock theft, ingredient spoilage, and mismatch.

BakeryPOS solves all of these challenges in a unified, beautifully styled web application that cashiers can operate on touchscreen monitors, laptops, desktop computers, or wireless tablets.

---

## 2. Why BakeryPOS? Core Benefits for Bakeries

| Problem in Bakeries | How BakeryPOS Solves It | Customer Impact |
| :--- | :--- | :--- |
| **Long customer queues** | Instant search by Name, SKU, Barcode, or visual Category tiles with keyboard shortcuts (`F4`, `Ctrl+/`). | Generates a complete invoice in under 5 seconds. |
| **Cake weight calculations** | Supports floating decimal quantities (`1.250 kg`, `0.350 kg`) with exact `BigDecimal` rounding. | No manual calculator errors; exact billing down to the paisa. |
| **Internet disconnection** | Fully offline local architecture — the database and backend run right on the shop's local PC. | Billing never halts even if broadband lines or Wi-Fi go down. |
| **Stock mismatch & pilferage** | Every completed sale deducts stock atomically in the database; manual stock edits require a mandatory audit reason. | Total transparency over who adjusted stock and when. |
| **Price changes tampering past records** | Invoices store permanent price and item name snapshots at the moment of billing. | Old bills and tax audits remain 100% accurate forever. |
| **Multi-payment handling** | Seamless single-click switching between **Cash**, **UPI / QR Code**, and **Card**. | Eliminates cash drawer discrepancies during daily closing. |

---

## 3. System Architecture & Technology Stack

BakeryPOS is engineered with a modern, decoupled client-server architecture built on industry-standard technologies:

```
┌─────────────────────────────────────────────────────────────┐
│                      BakeryPOS Client                       │
│  React 18 + Vite + Tailwind CSS v4 + Lucide Icons + PWA     │
│  (Desktop Browser, Tablet, or Standalone Installed App)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST API (JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BakeryPOS Backend Engine                  │
│  Java 24 / Spring Boot 3.4.3 + Spring Security 6            │
│  (Transactional Billing Engine, Validation, Audit Service)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC (ACID Transactions)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database Store                 │
│  Relational Storage: Users, Products, Stock, Invoices       │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Highlights
- **Single Source of Truth**: While the cashier counter provides immediate visual price and tax calculation for speed, the backend independently verifies product existence, stock availability, GST rate, and computes final invoice totals during checkout under `@Transactional(isolation = Isolation.REPEATABLE_READ)`.
- **Immutable Financial Snapshots**: When an invoice is generated, the item name, unit price, and GST rate are permanently frozen inside `order_items`. If you update a pastry's price from ₹40 to ₹50 tomorrow, all past bills will still show ₹40.
- **Role-Based Access Control (RBAC)**: Cashiers are restricted strictly to the POS screen, customer lookup, and invoice reprints. Back-office dashboards, product creation, stock adjustments, and staff credentials require Admin authentication.

---

## 4. Online vs. Offline Capabilities (100% Offline-Ready)

> [!IMPORTANT]
> **BakeryPOS does NOT require an internet connection for daily counter billing.**  
> The entire application, backend server, and database run locally on your bakery's computer.

### Feature Comparison Matrix

| Work / Operation | Works OFFLINE? (No Internet) | Works ONLINE? (With Internet) | How It Functions |
| :--- | :---: | :---: | :--- |
| **Counter Billing & Invoicing** | **YES** | **YES** | Local database executes checkouts instantly. |
| **Thermal Receipt Printing** | **YES** | **YES** | Communicates directly with local USB, Bluetooth, or LAN printers. |
| **Barcode Scanning** | **YES** | **YES** | Hardware scanner acts as keyboard input directly into the POS screen. |
| **Product & Price Management** | **YES** | **YES** | Updates saved instantly to local PostgreSQL database. |
| **Stock Adjustments & Alerts** | **YES** | **YES** | Automated real-time local inventory tracking. |
| **Sales Reports & Analytics** | **YES** | **YES** | Calculates revenue, top items, and totals locally. |
| **Multiple Counters / Tablets** | **YES** | **YES** | Tablets connect over your shop's Wi-Fi router (no internet needed). |
| **Remote Access from Home** | ❌ *No* | **YES** | Requires cloud hosting or port-forwarded internet connection. |
| **Cloud Backups (e.g. Google Drive)** | ❌ *No* | **YES** | Uploading backup files to external cloud storage requires internet. |

> [!TIP]
> **Connecting Wireless Tablets in Your Shop (Zero Internet Required):**  
> If you have a standard Wi-Fi router in your bakery (even without an active internet connection), any iPad, Android tablet, or mobile phone connected to the same Wi-Fi can open the main PC's IP address (e.g., `http://192.168.1.100:5173`) and start billing customers simultaneously!

---

## 5. Hardware & Peripheral Setup

BakeryPOS is hardware-agnostic and works seamlessly with standard retail POS peripherals:

### 1. Thermal Receipt Printers
- **Standard Supported Width**: **80mm (3-inch)** and **58mm (2-inch)** thermal receipt printers.
- **Interface Support**: USB, Ethernet / LAN, Wi-Fi, or Bluetooth.
- **Brands Tested**: Epson, TVS Electronics, NGX, Posiflex, Star Micronics, Citizen, and generic ESC/POS printers.
- **Paper Cutting**: Standard auto-cutter triggers automatically via browser print spooler.

### 2. Barcode Scanners
- **Type**: 1D and 2D handheld USB or wireless Bluetooth scanners.
- **Operation**: Plug-and-play (HID keyboard mode). When a barcode is scanned, the scanner automatically inputs the code and presses `Enter`, instantly adding the item to the bill.

### 3. Cash Drawers
- **Connection**: Standard RJ11 / RJ12 connector hooked directly into the back of your thermal receipt printer. The drawer kicks open automatically whenever an invoice prints.

### 4. Computer & Display Specifications
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Minimum Requirements**: Intel Core i3 or equivalent, 4 GB RAM, 20 GB free disk space.
- **Recommended Touchscreen**: 15-inch to 21-inch touchscreen monitor or 10-inch+ tablet for smooth touch interactions.

---

## 6. Getting Started: Launch & Desktop / Tablet App Installation (PWA)

### Accessing the Web Application
Open your web browser (Google Chrome or Microsoft Edge recommended) and navigate to your bakery's local or cloud URL:
- Local Development / Standard URL: `http://localhost:5173`
- Local Apache Production URL: `http://localhost/`

---

### Installing BakeryPOS as a Native Desktop App (Recommended)
You do not need to keep BakeryPOS inside a standard browser with URL bars and tabs. It can be installed as a **standalone desktop app**:

```
[ Chrome / Edge Browser URL Bar ] ──► Click the (Install App) Icon ──► Click "Install"
                                                                             │
                                                                             ▼
[ Desktop Icon Created ] ◄────── Opens in Dedicated Fullscreen Window (No URL Bar)
```

1. **Google Chrome / Microsoft Edge on Windows or Mac**:
   - Navigate to the POS URL.
   - Look at the top navigation bar inside BakeryPOS and click the **Install App** button with the download icon (or click the install icon at the right end of the browser address bar).
   - Click **Install** in the popup confirmation dialog.
   - A desktop shortcut named **BakeryPOS** will automatically appear on your desktop and Start Menu.
   - Double-clicking this icon opens BakeryPOS in a clean, distraction-free fullscreen counter window.

2. **Apple Safari on iPad / iPhone**:
   - Open Safari and navigate to the application URL.
   - Tap the **Share** button (box with an upward arrow).
   - Scroll down and tap **Add to Home Screen**.
   - Tap **Add** in the top-right corner.
   - Launch from your iPad home screen for an ultra-fast, touch-friendly cashier counter experience.

---

## 7. User Accounts, Roles & Password Management

BakeryPOS includes enterprise-grade Spring Security with JWT (JSON Web Tokens) to ensure secure sessions and prevent unauthorized access.

### Operational Roles & Access Levels

| Role | Default Username | Default Password | Access Level & Permissions |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin` | `admin123` | **Full Store Control**: Dashboard analytics, Product creation/editing, Category setup, Stock adjustments, Staff management, Shop settings, and Billing. |
| **Counter Cashier** | `cashier` | `cashier123` | **Counter Cashier**: High-speed POS billing, Customer creation/lookup, Personal bill history, and Receipt reprinting. Restricted from back-office settings and stock overrides. |

> [!CAUTION]
> **First-Time Security Action**:  
> Upon initial handover, store owners must log in as `admin`, click the **Key icon** (Change Password) in the top-right header, and set a new, confidential password.

---

### How to Change Your Password (Self-Service)
1. Log in to BakeryPOS.
2. In the top navigation bar, click the **Key icon** (Change Password) next to the Logout button.
3. In the modal that appears:
   - Enter your **Current Password**.
   - Enter your **New Password** (minimum 6 characters).
   - Re-enter the new password in **Confirm Password**.
4. Click **Update Password**. The new password takes effect immediately.

### How Store Admins Reset a Cashier's Forgotten Password
1. Log in as an Administrator (`admin`).
2. Click **Staff Accounts** (`/users`) in the left navigation sidebar.
3. Find the cashier in the staff list.
4. Click the blue **Reset Pwd** button.
5. Enter a new temporary password and confirm.
6. The cashier can immediately log in with the new credentials.

---

## 8. Module 1: High-Speed POS Counter Billing (Step-by-Step)

The POS Screen (`/pos`) is the primary workspace where counter cashiers spend 95% of their working day. It is optimized for maximum speed, zero lag, and effortless usability.

```
┌────────────────────────────────────────────────────────┬──────────────────────────────────────────┐
│                   PRODUCT CATALOG PANEL                │             ACTIVE BILLING CART          │
│                                                        ├──────────────────────────────────────────┤
│  🔍 Search [Ctrl+/]  [ SKU / Name / Barcode ]         │  Invoice #: BAKE-20261006-4821           │
│                                                        │  Customer: [Walk-in Customer / Phone]    │
│  [All] [Cakes] [Pastries] [Breads] [Cookies] [Savories]├──────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  1. Black Forest Cake (0.50 kg)  ₹250.00 │
│  │ Chocolate    │  │ Butter       │  │ Veg Puff     │  │  2. Veg Puff              (2 pc)    ₹40.00 │
│  │ Truffle Cake │  │ Croissant    │  │              │  │  3. Cold Coffee           (1 pkt)   ₹60.00 │
│  │ ₹500/kg      │  │ ₹65/pc       │  │ ₹20/pc       │  ├──────────────────────────────────────────┤
│  └──────────────┘  └──────────────┘  └──────────────┘  │  Subtotal: ₹350.00  |  GST (5%): ₹17.50  │
│                                                        │  Discount: ₹0.00    |  TOTAL:    ₹367.50 │
│                                                        │  Payment: [CASH] [UPI] [CARD]            │
│                                                        │  [ F4 / Complete & Print Receipt 🖨️ ]     │
└────────────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

### Step 1: Locating Products
- **Option A (Barcode Scanner)**: Simply aim the scanner at the item package. The item is automatically added to the cart with quantity 1.
- **Option B (Instant Search Bar)**: Press `Ctrl + /` on your keyboard (or click the search box) and type the product name or SKU (e.g., `truffle` or `puff`). The list updates in real time.
- **Option C (Category Filter Chips)**: Click any category pill across the top (`Cakes`, `Pastries`, `Bread & Buns`, `Cookies & Biscuits`, `Savories & Puffs`, `Beverages`) to view only items in that section.
- **Option D (Visual Grid Click)**: Click or tap any product tile directly.

---

### Step 2: Adjusting Quantities & Decimal Weights
- **Piece Items (e.g., Veg Puff, Donut)**:
  - Click the **`+`** button to increase quantity or **`-`** to decrease.
  - Or click the quantity field directly and type any whole number (e.g., `12`).
- **Weighed Items (e.g., Fresh Cakes, Halwa, Biscuits by kg)**:
  - Weighed items support decimal fractions up to 3 decimal places (e.g., `0.750 kg`, `1.250 kg`, `2.5 kg`).
  - Type the exact weight into the quantity input.
  - The bill automatically computes the price:  
    $$\text{Item Price} = \text{Unit Rate} \times \text{Weight Quantity}$$  
    *(Example: ₹400/kg $\times$ 1.25 kg = ₹500.00)*

---

### Step 3: Adding Unlisted / Custom Items (Open Items)
If a customer wants an unlisted custom item (such as *Custom Birthday Candle Set* or *Special Gift Box*):
1. Click the **Custom Item** button above the cart.
2. Enter the **Item Name**, **Unit Price (₹)**, and **Quantity**.
3. Click **Add to Ticket**. It will be included in the bill immediately.

---

### Step 4: Selecting or Registering Customers
- **Walk-in Customers**: By default, the bill is assigned to **Walk-in Customer**. No extra steps are needed.
- **Existing Customer**: Click the customer search field, type the customer's phone number or name, and select them from the dropdown.
- **New Customer Quick Registration**:
  1. Click the **`+` New Customer** button.
  2. Enter the customer's **Name** and **Phone Number**.
  3. Click **Save Customer**. The new customer is saved to the database and automatically selected for the current bill.

---

### Step 5: Applying Discounts
1. In the cart footer, locate the **Discount** field.
2. Choose either **Fixed Amount (₹)** or **Percentage (%)**.
3. Type the discount value (e.g., ₹50 or 10%). The grand total recalculates instantly.

---

### Step 6: Choosing Payment Method & Checkout
1. Select the payment method with a single click:
   - 💵 **CASH**: Standard cash payment at the counter.
   - 📱 **UPI / QR Code**: Customer scanned Google Pay, PhonePe, Paytm, or BHIM QR code.
   - 💳 **CARD**: Credit or Debit card swiped on your POS terminal.
2. Complete Checkout:
   - Click the big green **Checkout & Print Receipt** button.
   - **Keyboard Shortcut**: Press **`F4`** or **`Ctrl + Enter`** to complete checkout without touching the mouse!
3. The invoice modal pops up, stock is deducted in the database, and the receipt printer prints the bill.

---

### POS Counter Keyboard Shortcuts Summary

| Shortcut Key | Function |
| :--- | :--- |
| **`Ctrl + /`** | Instantly focus the Product Search bar |
| **`F4`** or **`Ctrl + Enter`** | Instantly Complete Checkout & trigger Receipt Print |
| **`Esc`** | Clear product search text or close open modals |

---

## 9. Module 2: Thermal Receipt Printing & A4 Tax Invoices

Whenever a sale is completed—or when reprinting any bill from the sales history—the **Invoice Modal** opens:

### Supported Print Formats
1. **80mm Thermal Receipt (Standard Counter Slip)**:
   - Compact, high-contrast slip designed for standard 80mm / 58mm thermal rolls.
   - Features store header branding, contact phone, invoice number, date/time timestamp, cashier name, customer details, itemized table with weights and rates, subtotal, GST tax breakup, discount, grand total, payment method, and friendly footer greeting.
2. **Standard A4 Tax Invoice**:
   - Clean, formal document format suitable for bulk party orders, corporate catering, or B2B clients who need formal tax invoices.

### Receipt Operations
- **Direct Browser Print**: Click **Print Receipt** (or press `Enter`). The browser print dialog opens with pre-optimized paper margins.
- **Copy Invoice Number**: Click the copy icon next to the invoice number for quick sharing via WhatsApp or customer support.

---

## 10. Module 3: Product Catalog & Menu Management

Store administrators can manage the entire bakery menu by navigating to **Products** (`/products`) in the sidebar.

```
┌────────────────────────────────────────────────────────────────────────┐
│  📦 Bakery Catalog Management                                           │
│  [+ New Product]  [+ New Category]   🔍 Search Products...  [Grid/Table]│
├────────────────────────────────────────────────────────────────────────┤
│  Name               Category     Price    Tax %   Stock    Status      │
│  ─────────────────  ───────────  ───────  ─────   ─────    ───────     │
│  Black Forest Cake  Cakes        ₹500.00   5%     8.5 kg   In Stock    │
│  Veg Puff           Savories      ₹20.00   5%     45 pcs   In Stock    │
│  Chocolate Donut    Pastries      ₹45.00   5%      2 pcs   Low Stock ⚠️│
│  Almond Biscotti    Cookies      ₹180.00   5%      0 pkts  Out of Stock│
└────────────────────────────────────────────────────────────────────────┘
```

### Adding a New Bakery Product
1. Click the **`+ New Product`** button.
2. Fill in the product details:
   - **Product Name** (e.g., *Red Velvet Cake*).
   - **Category** (e.g., *Cakes*).
   - **SKU Code** (Unique identifier, e.g., `CAKE-RV-01`).
   - **Barcode** (Optional scan or code for the barcode reader).
   - **Selling Price (₹)** (The counter retail price per unit).
   - **Cost Price (₹)** (The bakery production / purchase cost, used to compute profit).
   - **GST / Tax Rate (%)** (e.g., `5.00%`).
   - **Initial Stock Quantity** (e.g., `15`).
   - **Low Stock Threshold Alert** (e.g., `3` — system alerts you when inventory dips below this).
   - **Unit of Measurement**:
     - `Piece / pc` — for individual buns, puffs, donuts.
     - `Kilogram / kg` — for whole cakes, sweets, dry fruits.
     - `Gram / gm` — for small packaged goods.
     - `Packet / pkt` — for toast, biscuits, rusks.
     - `Box` — for assorted gift boxes.
     - `Liter / ltr` — for beverages, fresh milk, juices.
   - **Product Image URL** (Optional web image URL for visual counter tiles).
3. Click **Save Product**. The item is immediately live at the billing counter.

### Editing or Deactivating Products
- Click the **Edit (Pencil)** icon to update prices, tax rates, or reorder thresholds.
- Click the **Trash / Deactivate** icon to retire seasonal or discontinued products without deleting historical sales records.

---

## 11. Module 4: Live Inventory Control & Stock Audit Logs

Stock control in retail bakeries is critical to prevent waste, shrinkage, and stock-outs. The **Inventory Management** page (`/inventory`) provides complete stock visibility.

### Real-Time Stock Status Badges
- 🟢 **In Stock**: Product quantity is safely above the low-stock threshold.
- 🟡 **Low Stock**: Product quantity is at or below the reorder threshold. Store managers should re-bake or re-order.
- 🔴 **Out of Stock**: Product quantity is zero. Cannot be billed until restocked.

---

### How to Perform a Manual Stock Adjustment
When you bake a fresh morning batch, receive supplier deliveries, or discard damaged/expired items:
1. Navigate to **Inventory** (`/inventory`).
2. Click the **Adjust Stock** button.
3. Select the **Product**.
4. Enter the **Quantity Change**:
   - Use a **positive number** (e.g., `+10`) to add stock after fresh baking.
   - Use a **negative number** (e.g., `-3`) to record spoiled, burned, or damaged goods.
5. Enter a mandatory **Audit Reason** (e.g., *Morning fresh bake batch #4*, *Damaged during transit*, *End of day shrinkage*).
6. Click **Confirm Adjustment**.

### Permanent Audit Trail
BakeryPOS maintains a complete, tamper-proof history of every single inventory change under the **Inventory Audit Log** tab:
- Exact date and timestamp.
- User who authorized the adjustment.
- Transaction type (`SALE` or `MANUAL_ADJUSTMENT`).
- Quantity changed and final resulting stock balance.
- Recorded explanation reason.

---

## 12. Module 5: Customer Directory & Loyalty Records

The **Customer Directory** (`/customers`) allows you to maintain customer relationships, capture contact information, and review purchase patterns.

### Managing Customers
- **Search Customers**: Filter by name or mobile phone number.
- **Add Customer**: Save customer full name, contact phone, and optional notes.
- **Edit Customer Details**: Update phone numbers or names anytime.
- **Purchase History Link**: Every customer is linked directly to their invoices in the sales history, making it easy to track frequent bakery patrons and birthday cake buyers.

---

## 13. Module 6: Sales Bills & Invoices History

The **Orders & Bills** screen (`/orders`) records every finalized transaction in the bakery.

### Search and Filter Invoices
- **Universal Search**: Search by **Invoice Number** (e.g., `BAKE-20261006-0001`), **Customer Name**, or **Cashier Username**.
- **Payment Filter**: View bills paid specifically by **Cash**, **UPI**, or **Card**.
- **Date Presets**: Instantly filter between **Today's Bills**, **Yesterday's Bills**, or **All Time**.

### Invoice Actions & Historical Integrity
- Click any bill to view complete itemized breakdowns, cashier timestamps, and tax calculations.
- Click the **Printer** icon on any past bill to instantly reprint the receipt slip.
- Because all line items are saved with **historical price snapshots**, reprinting a bill from 6 months ago will always show the exact price the customer paid at that moment.

---

## 14. Module 7: Executive Analytics & Sales Dashboard

The **Dashboard** (`/dashboard`) provides owners and managers with instant, real-time business performance metrics aggregated directly from the PostgreSQL database:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  TODAY REVENUE  │  │  ORDERS COUNT   │  │  AVG BILL VALUE │  │  LOW STOCK ITEMS│
│    ₹14,850.00   │  │    72 Orders    │  │     ₹206.25     │  │   4 Items ⚠️    │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Key Performance Indicators (KPIs)
1. **Today's Revenue**: Total cash and digital collection for the current business day.
2. **Today's Orders**: Total number of customers billed today.
3. **Average Bill Value**: Average spend per customer ticket ($\text{Revenue} / \text{Orders}$).
4. **Low Stock Alerts**: Number of products currently running low in the kitchen.

### Visual Breakdown Cards
- **Payment Method Distribution**: Clear percentage and rupee comparison between **Cash**, **UPI / QR**, and **Card** receipts. Makes evening bank deposits and cash drawer audits effortless.
- **Top-Selling Bakery Items**: Ranked list of your fastest-moving cakes, savories, and breads to help bakers plan tomorrow morning's production batches.

---

## 15. Module 8: Staff & Cashier User Administration

Store owners can manage counter staff under the **Staff Accounts** (`/users`) page:

### Capabilities
- **Create New Cashier**: Set up personalized usernames and passwords for new counter employees.
- **Role Assignment**: Assign either `ROLE_STAFF` (Cashier) or `ROLE_ADMIN` (Store Manager / Owner).
- **Activate / Deactivate Accounts**: When an employee leaves, simply deactivate their account with one click without losing their past billing audit trail.
- **Admin Password Reset**: Instantly reset passwords for staff who forget their login credentials.

---

## 16. Module 9: Shop & Invoicing Configuration (Store Settings)

The **Settings** page (`/settings`) allows store owners to tailor BakeryPOS to match their bakery's exact brand identity and tax requirements.

### Configurable Store Settings

| Setting Field | Example Value | Where It Appears |
| :--- | :--- | :--- |
| **Bakery Shop Name** | `Sweet Delights Bakery & Cafe` | Printed boldly at the top of every receipt slip and in app header. |
| **Phone Number** | `+91 98765 43210` | Printed in receipt header for customer service & cake bookings. |
| **Email Address** | `orders@sweetdelights.com` | Printed on tax invoices and receipts. |
| **Shop Address** | `42 Artisan Boulevard, Pastry District` | Printed below shop name on all thermal receipts and A4 invoices. |
| **Invoice Number Prefix** | `BAKE` or `SD` | Formats all invoice numbers (e.g., `BAKE-20261006-1042`). |
| **Default Tax / GST Rate (%)**| `5.00` | Automatically applied to new products and calculated during checkout. |
| **Currency Symbol** | `₹` (or `$`, `€`, `AED`) | Displayed across all prices, cards, and printed receipts. |
| **Receipt Footer Message** | `Thank you for tasting happiness! Visit us again soon.` | Printed at the very bottom of every thermal receipt slip. |

---

## 17. Daily Operational Checklist for Cashiers & Store Managers

Follow this simple daily routine for smooth bakery counter operations:

### 🌅 Morning Opening Routine (8:00 AM)
1. Turn on the main PC or billing terminal.
2. Turn on the thermal receipt printer and verify the paper roll has enough paper.
3. Launch BakeryPOS from the desktop shortcut icon.
4. Log in using your Cashier credentials.
5. Check the **Inventory** or **Dashboard** to see items flagged with **Low Stock**.
6. When morning fresh bakes arrive from the kitchen, update the inventory count via **Adjust Stock**.

### 🎂 Counter Rush Hours (All Day)
1. Keep the billing screen open on the POS counter.
2. Use `Ctrl + /` to quickly find cakes and pastries.
3. For cakes and sweets sold by weight, enter exact decimal quantities (e.g. `1.25 kg`).
4. Select the payment method (Cash / UPI / Card).
5. Press **`F4`** to complete checkout and print the receipt slip for the customer.

### 🌙 Evening Closing & Reconciliation (9:00 PM)
1. Open the **Dashboard** (`/dashboard`) or **Orders** (`/orders`) page.
2. Note the total **Cash Collection** shown under payment breakdown.
3. Count the actual cash in your physical counter cash drawer and verify it matches the system total.
4. Verify UPI payments against your UPI business app (Google Pay / PhonePe merchant).
5. Log out of BakeryPOS.
6. Run the daily 1-click database backup (detailed below) to keep today's sales data 100% secure.

---

## 18. Data Safety, Backup & Disaster Recovery Guide

All product catalogs, customer records, and invoice histories are stored securely in PostgreSQL. Taking regular backups ensures your data is protected against computer failure, accidental deletion, or hardware replacement.

### Taking a Database Backup (1-Step Process)
Run the following command from PowerShell on your main PC:

```powershell
$env:PGPASSWORD = "postgres"
pg_dump.exe -U postgres -h localhost -p 5432 -d bakerypos_db -F p -f "d:\Projects\Billing System\backups\bakery-backup-$(Get-Date -Format 'yyyy-MM-dd').sql"
```

*(This automatically creates a timestamped SQL backup file in the `backups/` folder).*

> [!TIP]
> **Recommended Best Practice**:  
> Copy the generated `.sql` backup file once a week to a USB thumb drive or your personal Google Drive / OneDrive account for complete off-site protection.

### Restoring the Database from Backup (Disaster Recovery)
If you ever move to a brand-new computer or need to recover from a backup:

```powershell
$env:PGPASSWORD = "postgres"
# 1. Create a fresh clean database
psql.exe -U postgres -h localhost -c "DROP DATABASE IF EXISTS bakerypos_db;"
psql.exe -U postgres -h localhost -c "CREATE DATABASE bakerypos_db;"

# 2. Restore all data from your backup file
psql.exe -U postgres -h localhost -d bakerypos_db -f "d:\Projects\Billing System\backups\your-backup-file.sql"
```

All your products, invoices, customers, and settings will be restored immediately.

---

## 19. Frequently Asked Questions (FAQ) & Troubleshooting

### Q1: What happens if our shop's internet connection drops?
**Answer**: Absolutely nothing! BakeryPOS is 100% offline-ready. Your cashiers can continue searching products, weighing cakes, billing orders, and printing receipts with zero interruption.

---

### Q2: How do I bill items sold by weight like 750 grams of cake?
**Answer**:
1. Click the cake item to add it to your ticket.
2. In the quantity box, type `0.75` (since 750 grams = 0.75 kg).
3. The system automatically multiplies ₹ rate $\times$ 0.75 and sets the exact price.

---

### Q3: My thermal printer is printing strange characters or blank lines. How do I fix it?
**Answer**:
1. Verify the thermal paper roll is placed with the heat-sensitive side facing up.
2. In the browser print dialog, select your specific thermal printer (e.g., *POS-80* or *Epson TM-T82*).
3. Set **Paper Size** to `80mm` or `Roll Paper 80 x 297 mm`.
4. Ensure **Margins** is set to `None` or `Minimum`.
5. Uncheck **Headers and footers** in the browser print dialog so browser date/URL does not print on the slip.

---

### Q4: If I increase the price of Chocolate Croissant today, will last month's bills change?
**Answer**: **No.** BakeryPOS uses immutable historical snapshot pricing. Every invoice freezes the item name, unit price, and GST rate at the exact moment of sale. Your past sales totals and financial records will never be altered.

---

### Q5: Can multiple cashiers bill at the same time?
**Answer**: **Yes.** You can run multiple cashier counters simultaneously. Additional tablets, laptops, or smartphones connected to your shop's Wi-Fi can open the main PC's URL and bill orders concurrently into the same shared database.

---

### Q6: How do I change our bakery's name, phone number, or receipt footer message?
**Answer**:
1. Log in with an **Admin** account.
2. Navigate to **Settings** (`/settings`) from the sidebar.
3. Update your shop name, phone number, GST rate, or receipt footer message.
4. Click **Save Settings**. All future receipts will print with your new details immediately.

---

### Q7: Can a cashier delete or edit a completed bill?
**Answer**: **No.** Completed invoices cannot be silently deleted or edited by cashiers. This security control prevents cashier fraud and ensures your sales audit trail matches your cash drawer. If an adjustment is needed, an Admin can log an inventory adjustment with a formal reason.

---

## 20. Summary & Quick Reference Cheat Sheet

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BAKERYPOS QUICK REFERENCE CHEAT SHEET                │
├────────────────────────────────────────────────────────────────────────┤
│  DEFAULT LOGINS:                                                       │
│  • Master Admin:   Username: admin    | Password: admin123             │
│  • Counter Staff:  Username: cashier  | Password: cashier123           │
│                                                                        │
│  KEYBOARD SHORTCUTS:                                                   │
│  • Ctrl + /            Focus Product Search Bar                        │
│  • F4 or Ctrl + Enter  Instantly Checkout & Print Receipt              │
│  • Esc                 Clear Search Text / Close Modals               │
│                                                                        │
│  KEY SCREENS:                                                          │
│  • /pos          High-Speed Counter Billing                            │
│  • /dashboard    Daily Revenue & Performance Analytics                 │
│  • /products     Menu, Pricing, Barcodes & Category Setup              │
│  • /inventory    Stock Monitoring & Manual Batch Adjustments           │
│  • /orders       Past Invoices, History & Receipt Reprinting           │
│  • /customers    Customer Phone Directory & Profiles                   │
│  • /users        Cashier Staff Accounts & Password Resets              │
│  • /settings     Bakery Name, Contact, Tax % & Receipt Greetings       │
└────────────────────────────────────────────────────────────────────────┘
```

---

> [!NOTE]
> **Need Additional Help or Customization?**  
> For technical support, custom hardware integrations, or database maintenance inquiries, please contact your systems engineering team.