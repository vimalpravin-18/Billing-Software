# 🍞 BakeryPOS — Easy & Simple Setup, Backup & Operations Guide

> **Welcome!** This simple guide has everything you need in **easy, step-by-step instructions**, with all **passwords**, **usernames**, **URLs**, **backup/restore steps**, and **online/offline details** clearly explained.

---

## 🔑 1. Quick Info: All Passwords, Usernames & URLs

Here are all the credentials and links used across the whole project:

### 👤 Web App Logins (Use these to log into the Billing Screen)
| Role | Username | Password | What it does |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access (Billing, Products, Reports, Settings, Staff) |
| **Cashier / Staff** | `cashier` | `cashier123` | POS Billing counter access |

---

### 🗄️ Database Credentials (PostgreSQL)
| Setting | Default Value | Where to change if your PC is different |
| :--- | :--- | :--- |
| **Host** | `localhost` | `backend/src/main/resources/application.properties` (Line 5) |
| **Port** | `5432` | `backend/src/main/resources/application.properties` (Line 5) |
| **Database Name** | `bakerypos_db` | `backend/src/main/resources/application.properties` (Line 5) |
| **DB Username** | `postgres` | `backend/src/main/resources/application.properties` (Line 6) |
| **DB Password** | `postgres` | `backend/src/main/resources/application.properties` (Line 7) |

> 💡 **Tip:** If your PostgreSQL password on your laptop is something else (like `root`, `1234`, or `admin`), open `backend/src/main/resources/application.properties` and change line 7:  
> `spring.datasource.password=YOUR_PASSWORD`

---

### 🌐 Project URLs
| Service | URL | Notes |
| :--- | :--- | :--- |
| **Local Dev App** | `http://localhost:5173` | When running frontend with `npm run dev` |
| **Backend API** | `http://localhost:8080/api` | Spring Boot API server |
| **Backend Health Check** | `http://localhost:8080/api/health` | Open in browser to test if backend is running |
| **Apache Live Production** | `http://localhost/` | When deployed via Apache HTTP Server |

---

## 📶 2. Is this an Online or Offline App? (VERY IMPORTANT)

### 🟢 Short Answer: It is 100% OFFLINE-READY!
**BakeryPOS does NOT need an internet connection to run daily billing.**  
The database (PostgreSQL), backend (Spring Boot), and frontend all run locally inside your shop computer. Even if your shop's internet wire is cut, **your billing will never stop**.

---

### 📋 What Works OFFLINE vs ONLINE:

| Feature / Work | Can do OFFLINE? (No Internet) | Can do ONLINE? (With Internet) | How it works |
| :--- | :---: | :---: | :--- |
| **Cashier Billing & Invoicing** |  **YES** |  **YES** | Runs completely on your shop's local PC |
| **Print Thermal Receipts** |  **YES** |  **YES** | Connected via USB, Bluetooth, or LAN printer |
| **Add / Edit Products & Prices** |  **YES** |  **YES** | Stored in local PostgreSQL database |
| **Stock & Inventory Updates** |  **YES** |  **YES** | Deducts stock locally upon checkout |
| **Sales Reports & Analytics** |  **YES** |  **YES** | Generates daily & monthly sales locally |
| **Staff & Cashier Management** |  **YES** |  **YES** | Login and user accounts work locally |
| **Multiple Counter Tablets / Phones** |  **YES** |  **YES** | Tablets connect via local shop Wi-Fi router (No internet required!) |
| **Remote Access from Home** | ❌ *No* |  **YES** | Owner checking sales from outside the shop needs internet or port forwarding |
| **Cloud Backups (Google Drive / S3)**| ❌ *No* |  **YES** | Uploading backup files to cloud needs internet |
| **SMS / WhatsApp / Email Receipts** | ❌ *No* |  **YES** | Sending SMS/WhatsApp to customers requires internet API |

> 💡 **Multi-Device in Shop (No Internet needed):**  
> If you have a Wi-Fi router in your shop (even without internet connection), other cashier tablets or mobile phones can open `http://YOUR_MAIN_PC_IP/` and bill customers at the same time!

---

## 💾 3. How to Backup & Restore Database (Save & Recover Data)

All your products, invoices, and sales history are stored in PostgreSQL. You can take a backup anytime or restore an old backup in seconds.

---

### 📥 A. How to Take a BACKUP (Save Data to a File)

#### Method 1: Easy 1-Line Command (PowerShell)
Open PowerShell and run:
```powershell
$env:PGPASSWORD = "your_postgres_password"
pg_dump -U postgres -h localhost -p 5432 -d bakerypos_db -F p -f "d:\Projects\Billing System\backups\my-backup.sql"
```
*(Replace `your_postgres_password` with your PostgreSQL password).*  
✅ This creates a complete backup file: `backups\my-backup.sql`.

#### Method 2: Using pgAdmin (No Commands - 3 Clicks)
1. Open **pgAdmin**.
2. Right-click on `bakerypos_db` -> Click **Backup...**
3. In General tab, enter filename (e.g. `today_backup.sql`).
4. Click the **Backup** button at the bottom right. Done!

---

### 📤 B. How to RESTORE (Recover Data from a Backup File)

#### Method 1: Easy 1-Line Command (PowerShell)
To restore the existing backup file included in your project:
```powershell
$env:PGPASSWORD = "your_postgres_password"
psql -U postgres -h localhost -p 5432 -d bakerypos_db -f "d:\Projects\Billing System\backups\bakery-billing-production-backup-2026-09-18.sql"
```
*(Replace `your_postgres_password` with your PostgreSQL password).*  
✅ All tables, past invoices, products, and categories will be restored!

#### Method 2: Using pgAdmin (No Commands - 3 Clicks)
1. Open **pgAdmin**.
2. Right-click on `bakerypos_db` -> Click **Restore...**
3. Select the file: `d:\Projects\Billing System\backups\bakery-billing-production-backup-2026-09-18.sql`.
4. Click the **Restore** button. Done!

---

## 🚀 4. Easy Step-by-Step Deployment (4 Simple Steps)

Follow these 4 steps in order:

```
[ Step 1: Database ] ➡️ [ Step 2: Backend ] ➡️ [ Step 3: Frontend ] ➡️ [ Step 4: Apache ]
```

---

### Step 1: Create Database in PostgreSQL

1. Open **pgAdmin** or **SQL Shell (psql)** on your computer.
2. Run this single command to create the database:
   ```sql
   CREATE DATABASE bakerypos_db;
   ```
3. That's it! Spring Boot will automatically create all tables and default login users (`admin` & `cashier`) the first time it starts.

---

### Step 2: Start the Backend (Spring Boot)

1. Open **PowerShell** or Command Prompt.
2. Go into the `backend` folder:
   ```powershell
   cd "d:\Projects\Billing System\backend"
   ```
3. Build the backend file:
   ```powershell
   mvn clean package -DskipTests
   ```
   *(If `mvn` is not recognized, run: `..\tools\apache-maven-3.9.9\bin\mvn.cmd clean package -DskipTests`)*

4. Run the backend:
   ```powershell
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

5. **Test if it's working**:  
   Open your browser and visit: [http://localhost:8080/api/health](http://localhost:8080/api/health)  
   👉 You should see: `{"status":"UP"}`. Keep this window open!

---

### Step 3: Build the Frontend (React)

1. Open a **new / second PowerShell** window.
2. Go into the `frontend` folder:
   ```powershell
   cd "d:\Projects\Billing System\frontend"
   ```
3. Make sure `frontend/.env.production` contains:
   ```env
   VITE_API_URL=/api
   ```
   *(This is already set for you!)*

4. Build the production files:
   ```powershell
   npm run build
   ```
5. You will now have a folder named `d:\Projects\Billing System\frontend\dist`.

---

### Step 4: Setup Apache & Go Live!

1. **Copy the built frontend files**:
   - Copy everything inside `d:\Projects\Billing System\frontend\dist`
   - Paste it into your Apache folder, for example: `C:\Apache24\htdocs\bakerypos` (or `C:\xampp\htdocs\bakerypos`).

2. **Add Reverse Proxy to Apache Configuration**:  
   Open your Apache config file (`httpd.conf` or `conf/extra/httpd-vhosts.conf`) and paste this block at the bottom:

   ```apache
   <VirtualHost *:80>
       ServerName localhost
       DocumentRoot "C:/Apache24/htdocs/bakerypos"

       <Directory "C:/Apache24/htdocs/bakerypos">
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted

           # Prevents 404 errors when you refresh /pos or /products
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>

       # Connects Apache directly to your Spring Boot Backend
       ProxyPreserveHost On
       ProxyPass /api http://127.0.0.1:8080/api
       ProxyPassReverse /api http://127.0.0.1:8080/api
   </VirtualHost>
   ```

   *(Also make sure `mod_proxy`, `mod_proxy_http`, and `mod_rewrite` are enabled in Apache `httpd.conf` by removing the `#` in front of them).*

3. **Restart Apache**:
   - If using XAMPP: Click **Stop** then **Start** next to Apache.
   - If standalone Apache: Run `Restart-Service -Name Apache*` or `httpd -k restart`.

4. **Open BakeryPOS in your browser**:
   - Visit: [http://localhost](http://localhost)
   - Login with:  
     Username: `admin`  
     Password: `admin123`
   - **🎉 You are live!**

---

## ☁️ 5. Deploy Online: Vercel (Frontend) + Render (Backend) + Supabase (Database)

**Yes! You can deploy all three components for FREE using your single GitHub repository.**

- **Database (PostgreSQL)** ➡️ Managed on **Supabase** *(Reliable hosted PostgreSQL with pooled connection support)*
- **Backend (Spring Boot)** ➡️ Deployed on **Render** *(Supports Docker & Java runtime)*
- **Frontend (React/Vite)** ➡️ Deployed on **Vercel** *(Ultra-fast global CDN for React)*

---

### 🅰️ Step 1: Create Database on Supabase

1. Sign up/Log in at [supabase.com](https://supabase.com).
2. Click **New Project** and choose a name (e.g. `bakerypos-db`) and database password.
3. Once created, go to **Project Settings** ➡️ **Database**:
   - Note down your **Host** (e.g., `db.[PROJECT-REF].supabase.co`), **Port** (`5432`), **Database** (`postgres`), **User** (`postgres`), and your **DB Password**.
   - Your JDBC Connection URL for Render will be:
     `jdbc:postgresql://db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require`

---

### 🅱️ Step 2: Deploy Backend Web Service on Render

1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** ➡️ **Web Service**.
3. Select and connect your **GitHub repository**.
4. Configure service settings:
   - **Name**: `bakerypos-backend`
   - **Root Directory**: `backend` 👈 *(Tells Render to use the backend folder)*
   - **Runtime**: `Docker` *(Uses `backend/Dockerfile`)*
5. Add the following **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `DATABASE_URL` | `jdbc:postgresql://db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require` |
   | `DATABASE_USERNAME` | `postgres` |
   | `DATABASE_PASSWORD` | `<your-supabase-db-password>` |
   | `CORS_ALLOWED_ORIGINS` | `*` *(or your Vercel URL once created)* |
   | `PORT` | `8080` |
   | `JPA_DDL_AUTO` | `update` |
6. Click **Create Web Service**.
7. Test the deployed backend once ready at: `https://bakerypos-backend.onrender.com/api/health` (should return `{"status":"UP"}`).

---

### 🅲 Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** ➡️ **Project**.
3. Select your **GitHub repository**.
4. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select **`frontend`** 👈 *(Tells Vercel to build the frontend folder)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://bakerypos-backend.onrender.com/api` *(Your Render backend URL)* |
6. Click **Deploy**!
7. Vercel will build and assign a public URL (e.g. `https://bakery-billing.vercel.app`).

---

### 🔄 Step 4: Secure CORS on Render Backend
Go back to Render ➡️ **bakerypos-backend** ➡️ **Environment Variables** ➡️ Change `CORS_ALLOWED_ORIGINS` to your exact Vercel URL:  
`https://bakery-billing.vercel.app`

🎉 **Done!** Every `git push` will automatically trigger seamless redeployments across Vercel and Render while connected securely to Supabase!

---

## ⚡ 6. Super Fast Way to Run on Your PC (Without Apache)

If you just want to run the project right now on your computer for testing or daily work without setting up Apache:

1. **Terminal 1 (Backend)**:
   ```powershell
   cd "d:\Projects\Billing System\backend"
   mvn spring-boot:run
   ```
2. **Terminal 2 (Frontend)**:
   ```powershell
   cd "d:\Projects\Billing System\frontend"
   npm run dev
   ```
3. Open your browser and go to: [http://localhost:5173](http://localhost:5173)  
4. Log in with `admin` / `admin123`. Everything works immediately!

---

## 🛠️ 7. Quick Troubleshooting (Common Problems & 1-Minute Fixes)

### ❓ Problem 1: "Backend fails to start / Connection to localhost:5432 refused"
* **Reason**: PostgreSQL is either not running, or your password is not correct.
* **Fix**:
  1. Make sure PostgreSQL service is running in Windows Services.
  2. Open `backend/src/main/resources/application.properties`.
  3. Change `spring.datasource.password=postgres` to your actual PostgreSQL password (or set environment variable `DATABASE_PASSWORD`).

### ❓ Problem 2: "Port 8080 is already in use"
* **Reason**: An old instance of backend is still running in the background.
* **Fix**: In PowerShell run:
  ```powershell
  Stop-Process -Name "java" -Force
  ```
  Then start your backend again.

### ❓ Problem 3: "Page shows 404 Not Found when I refresh `/pos` or `/products`"
* **Reason**: Apache doesn't know about Single Page Application routing.
* **Fix**: Make sure `RewriteEngine On` and `RewriteRule . /index.html [L]` are in your Apache configuration (as shown in Step 4).

### ❓ Problem 4: "Cannot log in / Invalid credentials"
* **Fix**: Use:
  - Username: `admin`
  - Password: `admin123`
  *(Both are lowercase).*
