# BakeryPOS REST API Documentation

Base URL: `http://localhost:8080/api`

---

## Public / Health Endpoints
- `GET /health` — Health check endpoint (`{"status": "UP"}`).
- `POST /auth/login` — User login authentication. Returns JWT token, user info, role.

---

## Category Management (`/categories`)
- `GET /categories` — Fetch all active categories.
- `GET /categories/all` — Fetch all categories including inactive (Admin only).
- `POST /categories` — Create category (Admin only).
- `PUT /categories/{id}` — Update category (Admin only).
- `DELETE /categories/{id}` — Deactivate category (Admin only).

---

## Product Management (`/products`)
- `GET /products` — Fetch all active products.
- `GET /products/all` — Fetch all products (Admin only).
- `GET /products/category/{categoryId}` — Filter products by category.
- `GET /products/search?q={query}` — Search by name, SKU, barcode.
- `GET /products/low-stock` — Low stock products (Admin only).
- `POST /products` — Create product (Admin only).
- `PUT /products/{id}` — Update product (Admin only).
- `DELETE /products/{id}` — Deactivate product (Admin only).

---

## Customer Management (`/customers`)
- `GET /customers` — List customers.
- `GET /customers/search?q={query}` — Search customer by name or phone.
- `POST /customers` — Create new customer.
- `PUT /customers/{id}` — Update customer details.

---

## POS Orders & Billing (`/orders`)
- `POST /orders` — Create & process atomic order checkout.
  - Body: `{ customerId, paymentMethod, discountAmount, items: [{ productId, quantity }] }`
- `GET /orders` — List sales history orders.
- `GET /orders/{id}` — Get order details.
- `GET /orders/invoice/{invoiceNumber}` — Get order by invoice number.

---

## Inventory Control (`/inventory`)
- `POST /inventory/adjust` — Manual stock adjustment (Admin only).
- `GET /inventory/transactions` — All inventory audit transactions (Admin only).
- `GET /inventory/product/{productId}` — Inventory history for a product.

---

## Dashboard Analytics & Settings
- `GET /reports/dashboard` — Real-time shop KPIs summary.
- `GET /users` — Staff user management (Admin only).
- `POST /users` — Create staff user account (Admin only).
- `GET /settings` — Get shop settings.
- `PUT /settings` — Update shop settings (Admin only).
