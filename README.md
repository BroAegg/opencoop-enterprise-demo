# 🏛️ OpenCoop Enterprise ERP & Offline-First POS Engine

> **Sanitized Production-Grade Architecture Showcase**  
> *A high-throughput, offline-capable enterprise cooperative ERP & retail POS system engineered for reliability, financial accuracy, and zero-downtime operations.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB_Offline--First-orange?style=flat-square&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)
[![Vercel Ready](https://img.shields.io/badge/Deployment-Vercel_Ready-000?style=flat-square&logo=vercel)](https://vercel.com)

---

## 📌 Executive Summary

**OpenCoop** (NusaCoop Enterprise) is an architectural boilerplate and sanitized live showcase derived from a mission-critical cooperative ERP system built and maintained in live production (>1 year development, 2+ months operational stability with **0 downtime**). 

The system was engineered to solve three fundamental challenges in cooperative management and campus retail:
1. **Zero-Latency Offline Checkout:** Preventing revenue loss during network outages using client-side **IndexedDB caching** and asynchronous conflict-free background outbox synchronization.
2. **Double-Entry Financial Integrity:** Enforcing strict SAK-ETAP accounting rules with an autonomous **General Ledger (GL)** engine where debit/credit discrepancies are blocked at runtime.
3. **Automated SHU RAT Allocation:** Slashing annual dividend calculation cycles from **3 business days of manual spreadsheet reconciliation to under 15 seconds** based on Indonesian Cooperative Law (*UU No. 25/1992*).

---

## 🏗️ System Architecture & Data Flow

### 1. High-Level Enterprise Architecture

```mermaid
flowchart TD
    subgraph Client["Client Tier (Tablet POS & Admin Web)"]
        UI["React 18 / Next.js 14 App Router"]
        IDB[("Browser-Native IndexedDB\n(opencoop_pos_db)")]
        Print["Native ESC/POS Thermal Bridge\n(Bluetooth RFCOMM SPP 58mm/80mm)"]
        UI <--> IDB
        UI --> Print
    end

    subgraph SyncEngine["Resilient Synchronization Engine"]
        Outbox["Outbox Queue (UUID v4)"]
        Detector["Network Status Listener\n(Online / Offline Transition)"]
        Worker["Background Batch Sync Dispatcher"]
        IDB --> Outbox
        Detector --> Worker
        Outbox --> Worker
    end

    subgraph Server["Server Tier (Vercel Serverless / Node.js)"]
        API["Route Handlers (/api/pos/sync)"]
        Validation["Double-Entry Validation & Schema Guard"]
        Worker -->|HTTPS Batch POST| API
        API --> Validation
    end

    subgraph Ledger["Core Ledger & Storage Tier"]
        GL[("General Ledger Engine\nACID-Compliant PostgreSQL / SQLite")]
        COA["Chart of Accounts (COA)\nAssets, Liab, Equity, Rev, Exp"]
        SHU["Annual RAT Profit Distribution Module"]
        Validation --> GL
        GL <--> COA
        GL --> SHU
    end
```

---

### 2. Offline-First POS Transaction State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Cashier Scans Barcode / Selects Item
    Idle --> CartActive: Add Item to Cart
    CartActive --> CheckingNetwork: Cashier Taps Checkout

    state CheckingNetwork <<choice>>
    CheckingNetwork --> DirectServerSync: Network == ONLINE
    CheckingNetwork --> IndexedDbEnqueue: Network == OFFLINE

    DirectServerSync --> PrintReceipt: 200 OK from Server
    
    IndexedDbEnqueue --> LocalStockDeduct: Generate OFF-Invoice & Client UUID
    LocalStockDeduct --> SaveToOutbox: Store in outbox_transactions
    SaveToOutbox --> PrintReceipt: Thermal Print (Offline Flagged)

    PrintReceipt --> WaitingForRecovery: Badge Counter Incremented
    WaitingForRecovery --> BackgroundSync: Network Connection Restored
    BackgroundSync --> ServerReconciled: POST /api/pos/sync (Batch)
    ServerReconciled --> [*]: Mark Outbox Synced
```

---

### 3. Entity-Relationship Data Model (ERD)

```mermaid
erDiagram
    MEMBERS ||--o{ SAVINGS_TRANSACTIONS : deposits
    MEMBERS ||--o{ LOAN_APPLICATIONS : requests
    MEMBERS ||--o{ POS_TRANSACTIONS : purchases
    MEMBERS ||--o{ SHU_DISTRIBUTIONS : receives

    CHART_OF_ACCOUNTS ||--o{ JOURNAL_ITEMS : classified_by
    JOURNALS ||--|{ JOURNAL_ITEMS : contains

    PRODUCTS ||--o{ INVENTORY_BATCHES : tracks
    PRODUCTS ||--o{ POS_ITEMS : includes
    POS_TRANSACTIONS ||--|{ POS_ITEMS : contains

    MEMBERS {
        string id PK
        string member_number UK
        string name
        string department
        decimal total_simpanan
        decimal annual_purchases
    }

    JOURNALS {
        string id PK
        string reference_number UK
        date transaction_date
        string description
        decimal total_debit
        decimal total_credit
        string status
    }

    POS_TRANSACTIONS {
        string client_uuid PK
        string invoice_number UK
        string cashier_name
        decimal total_amount
        string payment_method
        string sync_status
        timestamp created_at
    }

    PRODUCTS {
        string id PK
        string sku UK
        string barcode UK
        string name
        decimal sell_price
        int stock
    }
```

---

## ⚡ Core Feature Specifications

### 1. Offline-First POS & Thermal Printing Bridge
* **Browser-Native IndexedDB Storage:** Uses `opencoop_pos_db` with dedicated object stores (`products`, `outbox_transactions`, `metadata`) eliminating third-party client database bloat.
* **Instant Stock Decrement:** Decrements local inventory caches in real-time during network blackouts to prevent cashier overselling.
* **ESC/POS Hardware Bridge:** Formats print receipts according to standard 58mm/80mm thermal specifications with simulated Bluetooth RFCOMM SPP socket bridge.
* **Zero Transaction Loss:** Client-generated RFC4122 UUID v4 ensures idempotency and conflict-free server reconciliation upon reconnect.

### 2. General Ledger & Double-Entry Accounting
* **SAK-ETAP Standard Chart of Accounts (COA):** Structured across standard accounts (1000 Assets, 2000 Liabilities, 3000 Equity, 4000 Revenue, 5000 COGS, 6000 Operating Expenses).
* **Strict Runtime Balanced Validation:** Journal posting is prevented unless $\sum \text{Debit} \equiv \sum \text{Credit}$ ($0\text{ discrepancy}$).
* **Real-Time Financial Statements:** Generates dynamic Balance Sheets (*Neraca*) and Income Statements (*Laporan Laba Rugi*) on demand.

### 3. Member Savings & Automated Payroll Deductions
* **Three-Tier Savings Ledger:** Tracks mandatory principal (*Simpanan Pokok*), monthly recurring (*Simpanan Wajib*), and liquid voluntary (*Simpanan Sukarela*) accounts.
* **Loan Amortization Engine:** Computes monthly principal and cooperative margin schedules with automated payroll deduction (*potong gaji*) integration for institutions.

### 4. Annual SHU RAT Profit Sharing Calculator
* **Statutory Compliance:** Automatically divides net profit based on Article 34 of Indonesian Law No. 25/1992:
  $$\text{SHU Anggota} = \left( \frac{\text{Simpanan Anggota}}{\text{Total Simpanan Koperasi}} \times \text{Alokasi Jasa Modal} \right) + \left( \frac{\text{Transaksi Anggota}}{\text{Total Omset Belanja}} \times \text{Alokasi Jasa Usaha} \right)$$
* **Real-Time Slips:** Generates printable individual member dividend distribution slips with audited breakdown.

---

## 🚀 Live Sandbox Demo & Quick Start

### 🌐 Live Demo URL
Deployable instantly to Vercel:
```bash
https://opencoop-enterprise-demo.vercel.app
```

### 🔑 Demo Role Switcher
The sandbox UI features a one-click **Role Switcher** in the top navigation bar:
| Role | Capabilities | Primary View |
| :--- | :--- | :--- |
| **Admin** | Full access to General Ledger, Member Savings, Journal Postings, and SHU RAT. | `/ledger`, `/shu` |
| **Kasir (Cashier)** | Fast POS checkout, offline simulator toggle, thermal receipt generation. | `/pos` |
| **Pengawas (Auditor)** | Read-only view of Audit Trails, Balance Sheet, and Reconciliation Logs. | `/ledger` |

---

## 🛠️ Local Development Setup

### 1. Clone the Clean Repository
```bash
git clone https://github.com/BroAegg/opencoop-enterprise-demo.git
cd opencoop-enterprise-demo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. How to Test the Offline-First Mechanism:
1. Open [http://localhost:3000/pos](http://localhost:3000/pos).
2. Click **"Uji Mode Offline Kasir"** on the top status bar (or disconnect WiFi in Chrome DevTools Network tab).
3. Add products to the cart and click **"SIMPAN KE INDEXEDDB OFFLINE"**.
4. Notice the **Thermal Receipt** generated with the `* TERSIMPAN SECARA LOKAL (INDEXEDDB) *` flag.
5. Inspect **Chrome DevTools → Application → IndexedDB → `opencoop_pos_db` → `outbox_transactions`** to inspect the stored payload.
6. Click **"Kembalikan ke Mode Online"** and tap **"Sync Now"** to watch the background sync commit to the server.

---

## 🚢 1-Click Vercel Deployment

Deploy this demo to Vercel with zero environment variable configuration required:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial sanitized enterprise cooperative demo"
   git branch -M main
   git remote add origin https://github.com/BroAegg/opencoop-enterprise-demo.git
   git push -u origin main
   ```
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Click **Deploy** (framework preset: Next.js).

---

## 🔒 Privacy & Sanitization Notice

This repository represents a **clean-room architecture demo**. All member identities, personal phone numbers, bank accounts, university affiliations, and proprietary credentials have been **100% removed and replaced with realistic synthetic test fixtures**. No production data from Koperasi Muhammadiyah Bandung (Bermadani) is contained herein.

---

## 👨‍💻 Author & Engineering Credits

* **Lead Architect & Engineer:** [Aegner Billik](https://linkedin.com/in/aegnerbillik)
* **GitHub:** [@BroAegg](https://github.com/BroAegg)
* **Portfolio:** [Technical Portfolio](https://aegneru-portof-dun.vercel.app)
