<<<<<<< HEAD
# Billing Software

Bakery billing and POS application.

## Technologies

- React
- Spring Boot
- PostgreSQL
- JPA / Hibernate
=======
<<<<<<< HEAD
# Billing-Software
=======
# BakeryPOS — Production Bakery Billing & Shop Management Suite

**BakeryPOS** is a fast, reliable, production-grade Point-of-Sale (POS) and shop management system built for daily counter usage in small/medium bakeries. It handles low-friction billing, decimal weight and piece math (`BigDecimal` precision), atomic inventory deduction, role-based security, thermal receipt printing, and real-time dashboard analytics.

---

## Key Features

- **Fast POS Counter**:
  - Live product search by Name, SKU, or Barcode.
  - Category quick-filters (`Cakes`, `Pastries`, `Bread & Buns`, `Cookies & Biscuits`, `Savories & Puffs`, `Beverages`).
  - Active billing cart with decimal quantity math (`1.5 kg * ₹400/kg`).
  - Walk-in or registered customer selector with quick customer creation modal.
  - Payment method selector (`CASH`, `UPI`, `CARD`).
  - Item discount application.

- **Atomic Billing Engine**:
  - Backend is the single source of truth for pricing and stock verification.
  - `@Transactional` DB isolation ensures order creation, inventory deduction, and transaction logging execute as a single atomic unit.
  - Historical invoices maintain snapshot product names and prices, guaranteeing historical accuracy even if catalog prices change later.

- **Thermal Receipt & Invoice Engine**:
  - 80mm thermal receipt print format & standard A4 print layout.
  - Browser print support (`window.print()`).
  - Automatic invoice number generation (`BAKE-YYYYMMDD-0001`).

- **Inventory Control & Audit**:
  - Live stock status badges with low-stock reorder alerts.
  - Manual stock adjustment modal with mandatory audit reason recording.
  - Historical audit trail of all inventory transactions.

- **Role-Based Security**:
  - `ADMIN`: Full access to dashboard analytics, inventory management, product CRUD, staff administration, and shop settings.
  - `STAFF` (Cashier): High-speed billing POS interface, customer lookup, order completion, personal bill history, and receipt printing.

- **Real-Time Analytics Dashboard**:
  - Today's revenue, order count, low stock count, top-selling bakery items, and payment method revenue breakdown.

---

## Tech Stack

### Backend
- **Framework**: Java 24 + Spring Boot 3.4.3
- **Security**: Spring Security 6 + JWT + BCrypt Password Encoder
- **Persistence**: Spring Data JPA + Hibernate ORM
- **Database**: PostgreSQL 18 (`bakerypos_db`) on Port 5432
- **Validation**: Jakarta Bean Validation (`jakarta.validation`)
- **Build Tool**: Apache Maven 3.9.9

### Frontend
- **Framework**: React 18 + JavaScript + Vite 8
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios with JWT Bearer Interceptors
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **State Management**: Context API (`AuthContext`, `CartContext`)

---

## Database Configuration

PostgreSQL database name: `bakerypos_db`
Default credentials (configured in `application.properties`):
- **Host**: `localhost:5432`
- **User**: `postgres`
- **Password**: `postgres` *(or set via `DATABASE_PASSWORD` environment variable)*

Tables automatically managed by Hibernate:
- `users`: Staff credentials & roles.
- `categories`: Product categories.
- `products`: Bakery item catalog, prices, units, and stock quantities.
- `customers`: Customer directory.
- `orders`: Invoice headers, subtotal, discount, tax, grand total, payment method.
- `order_items`: Line item snapshot records.
- `inventory_transactions`: Stock audit logs.
- `shop_settings`: Bakery shop branding and tax configuration.

---

## Default Dev Credentials

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Master Admin** | `admin` | `admin123` | Full system access (Dashboard, Products, Stock, Staff, Settings) |
| **Cashier Staff**| `cashier` | `cashier123` | POS Counter Billing, Customer Creation, Order History |

---

## How to Install as Desktop / Tablet App (PWA)

1. Open `http://localhost:5173` (or production URL) in **Google Chrome** or **Microsoft Edge**.
2. Click the **Install App** button in the top navigation bar (or click the install icon in the browser address bar).
3. The application will install as a standalone desktop app with high-resolution app icon, launching directly into counter billing mode without browser borders.

---

## How to Run locally

### 1. Start Backend (Spring Boot)
```powershell
cd backend
$env:JAVA_HOME="C:\Program Files\Java\jdk-24"
..\tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
```
Or run the packaged production JAR:
```powershell
java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
```
Backend will start on `http://localhost:8080`.

### 2. Start Frontend (React Vite)
```powershell
cd frontend
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## Testing Verification

### Automated Frontend Build Test
```powershell
cd frontend
npm run build
```

### End-to-End Billing Test (PowerShell / API)
Run the following PowerShell command to test user login, POS checkout, invoice generation, and atomic stock reduction:
```powershell
$loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ username = "cashier"; password = "cashier123" } | ConvertTo-Json);
$token = $loginRes.token;
$headers = @{ Authorization = "Bearer $token" };
$products = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Headers $headers;
Write-Host "Stock before sale:" $products[0].stockQuantity;

$orderBody = @{ customerId = $null; paymentMethod = "CASH"; discountAmount = 10.00; items = @( @{ productId = $products[0].id; quantity = 1 } ) } | ConvertTo-Json -Depth 5;
$orderRes = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -Headers $headers -ContentType "application/json" -Body $orderBody;

Write-Host "Created Invoice:" $orderRes.invoiceNumber "Total:" $orderRes.totalAmount;
$productsAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Headers $headers;
Write-Host "Stock after sale:" $productsAfter[0].stockQuantity;
```

---

## Project Documentation & Handover Guides
- [CLIENT_HANDOVER_GUIDE.md](file:///d:/Projects/Billing%20System/CLIENT_HANDOVER_GUIDE.md) — Complete client operations, credentials, password reset, backup & restore, and daily cashier checklist.
- [docs/architecture.md](file:///d:/Projects/Billing%20System/docs/architecture.md) — Architectural overview & design principles.
- [docs/database.md](file:///d:/Projects/Billing%20System/docs/database.md) — Relational schema & entity specifications.
- [docs/api.md](file:///d:/Projects/Billing%20System/docs/api.md) — REST API endpoint specification.
- [docs/development.md](file:///d:/Projects/Billing%20System/docs/development.md) — Developer setup & deployment guide.

>>>>>>> 4f743d6 (Initial commit)
>>>>>>> 5aba314 (Initial commit)
