# BakeryPOS Development & Deployment Guide

## Prerequisites
1. **Java JDK 21+** (Tested on Java 24.0.1)
2. **Node.js 20+** & **NPM 10+** (Tested on Node v24.19 / NPM 11.17)
3. **PostgreSQL 18** running on `localhost:5432` with database `bakerypos_db` initialized.

---

## Directory Structure
```
Billing System/
├── backend/                  # Spring Boot 3.4 Java Backend
│   ├── src/main/java/com/bakerypos/
│   │   ├── config/           # DataInitializer seed data
│   │   ├── controller/       # REST Controllers
│   │   ├── dto/              # Request / Response payloads
│   │   ├── entity/           # JPA Entities & Enums
│   │   ├── exception/        # Global Exception Handler
│   │   ├── repository/       # JPA Repositories
│   │   ├── security/         # Spring Security & JWT Token Provider
│   │   └── service/          # Transactional Business Services
│   └── pom.xml
├── frontend/                 # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/       # Header, Sidebar, Layout, InvoicePrintModal
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── pages/            # PosScreen, DashboardPage, ProductsPage, etc.
│   │   └── services/         # Axios API Client
│   └── vite.config.js
├── tools/                    # Portable Apache Maven 3.9.9
├── docs/                     # System & API Documentation
└── README.md
```

---

## Running in Production Mode

### Backend Package
```powershell
cd backend
$env:JAVA_HOME="C:\Program Files\Java\jdk-24"
..\tools\apache-maven-3.9.9\bin\mvn.cmd clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend Build
```powershell
cd frontend
npm run build
```
Dist folder: `frontend/dist/`.
