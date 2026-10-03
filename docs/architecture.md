# BakeryPOS Architecture Documentation

## 1. System Overview
BakeryPOS is structured using a client-server architecture:
- **Frontend Layer**: React 18 single-page application built with Vite and Tailwind CSS.
- **Backend Layer**: Spring Boot 3.4 REST service with layered architecture (`Controller -> Service -> Repository -> Database`).
- **Database Layer**: PostgreSQL 18 relational store.

---

## 2. Core Business Design Principles

### Backend as Source of Truth
The frontend calculates running totals for immediate UI feedback. However, during checkout, the backend independently:
1. Re-fetches active products from PostgreSQL.
2. Verifies stock availability.
3. Reads current unit prices and tax rates from DB entities.
4. Calculates line totals, subtotal, tax, discount, and grand total using `BigDecimal`.
5. Deducts inventory.
6. Saves `Order` and `OrderItem` records with snapshot prices.

All of the above execute within a single `@Transactional` boundary (`Isolation.REPEATABLE_READ`).

### Historical Snapshot Integrity
`OrderItem` entities store:
- `productNameSnapshot`
- `unitPriceSnapshot`
- `taxRateSnapshot`

This guarantees that future price updates or product deletions never mutate historical invoices or sales reports.

---

## 3. Security & Authorization
- **Authentication**: JWT stateless token issued upon successful login at `/api/auth/login`.
- **Role Control**:
  - `@PreAuthorize("hasRole('ADMIN')")` secures administrative operations (product editing, manual stock adjustments, user creation, shop settings).
  - Front-end route guards (`AdminRoute`, `ProtectedRoute`) mirror backend authorization.
