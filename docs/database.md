# BakeryPOS Database Documentation

## Database Information
- **Engine**: PostgreSQL 18
- **Database Name**: `bakerypos_db`
- **Default Port**: 5432
- **Driver**: `org.postgresql.Driver`

---

## Relational Tables Overview

### 1. `users`
- `id` (BIGINT, PK)
- `username` (VARCHAR, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR, NOT NULL)
- `full_name` (VARCHAR, NOT NULL)
- `role` (VARCHAR, NOT NULL) — `ROLE_ADMIN`, `ROLE_STAFF`
- `active` (BOOLEAN, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL)

### 2. `categories`
- `id` (BIGINT, PK)
- `name` (VARCHAR, UNIQUE, NOT NULL)
- `description` (VARCHAR)
- `active` (BOOLEAN, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL)

### 3. `products`
- `id` (BIGINT, PK)
- `name` (VARCHAR, NOT NULL)
- `description` (VARCHAR)
- `sku` (VARCHAR, UNIQUE, NOT NULL)
- `barcode` (VARCHAR)
- `category_id` (BIGINT, FK -> categories.id)
- `selling_price` (NUMERIC(12,2), NOT NULL)
- `cost_price` (NUMERIC(12,2), NOT NULL)
- `tax_rate` (NUMERIC(5,2), NOT NULL)
- `stock_quantity` (NUMERIC(12,3), NOT NULL)
- `low_stock_threshold` (NUMERIC(12,3), NOT NULL)
- `unit` (VARCHAR, NOT NULL)
- `image_url` (VARCHAR)
- `active` (BOOLEAN, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP)

### 4. `customers`
- `id` (BIGINT, PK)
- `name` (VARCHAR, NOT NULL)
- `phone` (VARCHAR, UNIQUE)
- `email` (VARCHAR)
- `address` (VARCHAR)
- `created_at` (TIMESTAMP, NOT NULL)

### 5. `orders`
- `id` (BIGINT, PK)
- `invoice_number` (VARCHAR, UNIQUE, NOT NULL)
- `customer_id` (BIGINT, FK -> customers.id, NULLABLE)
- `cashier_user_id` (BIGINT, FK -> users.id, NOT NULL)
- `subtotal` (NUMERIC(12,2), NOT NULL)
- `discount_amount` (NUMERIC(12,2), NOT NULL)
- `tax_amount` (NUMERIC(12,2), NOT NULL)
- `total_amount` (NUMERIC(12,2), NOT NULL)
- `payment_method` (VARCHAR, NOT NULL) — `CASH`, `UPI`, `CARD`
- `payment_status` (VARCHAR, NOT NULL) — `PAID`
- `order_status` (VARCHAR, NOT NULL) — `COMPLETED`
- `created_at` (TIMESTAMP, NOT NULL)

### 6. `order_items`
- `id` (BIGINT, PK)
- `order_id` (BIGINT, FK -> orders.id, NOT NULL)
- `product_id` (BIGINT, FK -> products.id, NULLABLE)
- `product_name_snapshot` (VARCHAR, NOT NULL)
- `quantity` (NUMERIC(12,3), NOT NULL)
- `unit_price_snapshot` (NUMERIC(12,2), NOT NULL)
- `tax_rate_snapshot` (NUMERIC(5,2), NOT NULL)
- `line_total` (NUMERIC(12,2), NOT NULL)

### 7. `inventory_transactions`
- `id` (BIGINT, PK)
- `product_id` (BIGINT, FK -> products.id, NOT NULL)
- `quantity_change` (NUMERIC(12,3), NOT NULL)
- `result_stock` (NUMERIC(12,3), NOT NULL)
- `transaction_type` (VARCHAR, NOT NULL) — `SALE`, `MANUAL_ADJUSTMENT`
- `reason` (VARCHAR)
- `user_id` (BIGINT, FK -> users.id)
- `created_at` (TIMESTAMP, NOT NULL)

### 8. `shop_settings`
- `id` (BIGINT, PK)
- `shop_name` (VARCHAR, NOT NULL)
- `address` (VARCHAR, NOT NULL)
- `phone` (VARCHAR, NOT NULL)
- `email` (VARCHAR)
- `invoice_prefix` (VARCHAR, NOT NULL)
- `default_tax_rate` (NUMERIC(5,2), NOT NULL)
- `currency_symbol` (VARCHAR, NOT NULL)
- `receipt_footer_text` (VARCHAR)
