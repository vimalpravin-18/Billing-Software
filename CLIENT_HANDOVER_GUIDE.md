# BakeryPOS — Production Client Handover & Operations Guide

**System Name**: BakeryPOS — Professional Bakery Point of Sale & Management Suite  
**Version**: 1.0.0 Production  
**Handover Date**: September 18, 2026  
**Auditor**: Senior Full-Stack Engineering & QA Team  

---

## 1. System Overview & Architecture

BakeryPOS is an enterprise-grade, web-first Point of Sale application designed specifically for retail bakeries. It supports both standalone counter cashier usage and centralized back-office administration.

### Technology Blueprint
- **Frontend**: React 18, Tailwind CSS v4, Progressive Web App (PWA) with Service Worker and offline fallback.
- **Backend**: Spring Boot 3.4.3, Java 21/24, Spring Security 6, JWT Authentication, Hibernate/JPA.
- **Database**: PostgreSQL 18 with relational integrity, constraints, and audit trails.
- **Hardware Integration**: Standard ESC/POS 80mm thermal receipt printers, barcode scanners, and touchscreens.

---

## 2. Browser Installation Guide (Progressive Web App - PWA)

BakeryPOS is engineered as an installable Progressive Web App (PWA). This eliminates the need to run inside a standard browser address bar and allows cashiers to launch BakeryPOS as a fullscreen desktop application.

### Installation Steps (Desktop / Laptop / Tablet)
1. **Google Chrome or Microsoft Edge**:
   - Open the BakeryPOS web URL: http://localhost:5173 (or your domain https://pos.yourbakery.com).
   - Look at the top right of the navigation bar inside BakeryPOS and click the **Install App** button (with download icon).
   - Alternatively, click the **Install icon** in the browser URL bar (or Menu ➔ *Save and Share* ➔ *Install BakeryPOS*).
   - Confirm by clicking **Install**.
   - BakeryPOS will now launch in its own standalone window and place a desktop shortcut icon on your Windows/Mac/Android desktop!

2. **Apple Safari (iPad / iPhone / Mac)**:
   - Open Safari and navigate to the application URL.
   - Tap the **Share** button (box with upward arrow).
   - Scroll down and tap **Add to Home Screen**.
   - Tap **Add** in the top-right corner.
   - Tap the BakeryPOS icon on your home screen to launch in fullscreen counter mode without browser controls.

---

## 3. Initial Staff Credentials & Access Control

The application comes pre-configured with two primary operational accounts:

| Role | Username | Initial Password | Recommended Action | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Master Admin** | dmin | dmin123 | **Change Immediately** | Full administrative control: Analytics, Inventory, Staff Accounts, Shop Settings, Product Catalog |
| **Counter Cashier** | cashier | cashier123 | **Change Password** | Counter POS Billing, Customer Lookup, New Customer Creation, Invoice Reprinting |

> [!WARNING]
> **Production Security Requirement**:
> Upon initial handover login, the store administrator must click the **Key icon** (Change Password) in the top navigation bar and set a secure production password.
>
> Developer/testing accounts (imal) have been disabled in the database prior to client handover.

---

## 4. How to Change Passwords

### For Currently Logged-in Staff (Self-Service)
1. Click the **Key icon** in the top navigation bar (next to the Logout button).
2. Enter your current password.
3. Enter your new password (minimum 6 characters).
4. Re-enter the new password to confirm.
5. Click **Update Password**. The new credentials take effect immediately across all sessions.

### For Store Admin (Resetting Staff Passwords)
1. Log in as an Administrator (dmin).
2. Navigate to **Staff Accounts** (/users) in the sidebar.
3. Locate the cashier staff account in the table.
4. Click the **Reset Pwd** button.
5. Enter the new temporary password for the cashier and click **Update Password**.
6. The staff member can now log in with the new password.

---

## 5. Database Backup & Disaster Recovery

A baseline production database backup has been created in the ackups/ directory:
- **Backup File**: ackups/bakery-billing-production-backup-2026-09-18.sql

### Creating a New On-Demand Database Backup
Run the following command from PowerShell:
`powershell
 = "your_db_password"
pg_dump.exe -U postgres -h localhost -p 5432 -d bakerypos_db -F p -f "backups\bakerypos-backup-2026-09-18.sql"
`

### Restoring the Database from Backup
In the event of hardware failure or disaster recovery:
`powershell
 = "your_db_password"
# 1. Create fresh database
psql.exe -U postgres -h localhost -c "DROP DATABASE IF EXISTS bakerypos_db;"
psql.exe -U postgres -h localhost -c "CREATE DATABASE bakerypos_db;"

# 2. Restore schema and data from SQL file
psql.exe -U postgres -h localhost -d bakerypos_db -f "backups\bakery-billing-production-backup-2026-09-18.sql"
`

---

## 6. Production Deployment & Configuration

### Environment Variables
Production environments should not hardcode secrets in source files. Configure the following environment variables:

| Variable | Description | Production Recommended Value |
| :--- | :--- | :--- |
| DATABASE_URL | PostgreSQL JDBC connection string | jdbc:postgresql://<db-host>:5432/bakerypos_db |
| DATABASE_USERNAME | Production DB user | e.g. akery_prod_user |
| DATABASE_PASSWORD | Strong DB password | *[Secure client password]* |
| JPA_DDL_AUTO | Hibernate schema management | update or alidate |
| JWT_SECRET | 256-bit cryptographically secure key | Random 64-char hex string |
| CORS_ALLOWED_ORIGINS | Comma-separated list of allowed domains | https://pos.yourbakery.com |
| PORT | Spring Boot HTTP port | 8080 (or reverse proxied via Nginx) |
| VITE_API_URL | Frontend API URL | https://pos.yourbakery.com/api |

### Running as a Windows Service or Background Service
To run the Spring Boot backend as a background service:
`powershell
java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
`
To serve the production frontend:
1. Build the production bundle:
   `powershell
   cd frontend
   npm run build
   `
2. Serve the rontend/dist folder using Nginx, Caddy, or IIS.

---

## 7. Daily Cashier Operation Checklist

- [ ] **Morning Opening**:
  1. Turn on the POS terminal and thermal receipt printer.
  2. Launch BakeryPOS from desktop icon.
  3. Sign in with Cashier credentials.
  4. Verify receipt paper roll is loaded.
- [ ] **Counter Billing Flow**:
  1. Select or search products using search bar, category chips, or barcode scanner.
  2. For weighed items (cakes, sweets), enter decimal quantities (e.g. 1.25 kg).
  3. Select customer or keep default *Walk-in Customer*.
  4. Select payment method: **Cash**, **UPI / QR Code**, or **Card**.
  5. Click **Checkout & Print Receipt** (Enter shortcut).
  6. Hand thermal slip to customer.
- [ ] **Evening Closing**:
  1. Open **Sales & Bills History** (/orders) to audit total day sales.
  2. Check cash collection against system cash total.
  3. Log out of BakeryPOS.
  4. Perform daily database backup.