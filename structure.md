# BhoomiSetu - Project Structure & Information

**BhoomiSetu** is a Real-Time National Land Acquisition & Management System built to digitize and enforce the RFCTLARR Act 2013 (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013). This project is actively being built and migrated to a modern Next.js/Firebase architecture for the Smart India Hackathon (SIH) 2026.

## 📂 Root Directory Structure

The repository is organized as a monorepo containing legacy components, modern React/Vite frontends, and newly migrated Next.js Serverless Firebase backend APIs.

```text
SIH_2026/
├── frontend/                 # 🖥️ Modern React + Vite Frontend
│   ├── src/                  
│   │   ├── components/       # UI Components (GIS Maps, Alerts, Calculators, Dashboards)
│   │   ├── context/          # React Contexts (AuthContext)
│   │   ├── pages/            # Main application views (Valuation, Grievances, etc.)
│   │   ├── services/         # API Client services
│   │   └── data/             # Static dummy JSON data (legacy)
│   └── vite.config.js        # Vite build configuration
│
├── backend/                  # ⚙️ Legacy Express Node.js Backend
│   ├── api/                  # Express routes
│   ├── data/                 # Legacy flat-file JSON databases
│   ├── services/             # Legacy business logic (rfctlarrEngine.js)
│   └── server.js             # Main Express server entry point
│
├── app/                      # ⚡ Modern Next.js App Router (Firebase API Layer)
│   └── api/                  
│       ├── admin/            # Administrative APIs
│       │   └── set-role/     # Role Assignment using Firebase Custom Claims
│       ├── dev/              
│       │   └── seed-firestore/ # Dummy Data Seeder for presentation/testing
│       ├── test-auth/        # Middleware Auth testing route
│       └── v1/valuation/     
│           └── calculate-award/ # Next-Gen Valuation Engine API (Generates Form 11)
│
├── lib/                      # 🛠️ Shared Libraries and Core Utilities
│   ├── firebase/             
│   │   ├── admin.ts          # Firebase Admin SDK Initialization
│   │   └── client.ts         # Firebase Client SDK Initialization
│   ├── middleware/           
│   │   └── withAuth.ts       # Secure HOF protecting API routes via RBAC
│   └── utils/                
│       └── valuationEngine.ts# RFCTLARR Mathematical Logic (First & Second Schedules)
│
├── types/                    # 🏷️ TypeScript Definitions
│   ├── schema.ts             # Firestore Collections (Users, Projects, Parcels, AuditLogs)
│   └── valuation.ts          # Statutory Awards (Form 11, R&R structures)
│
├── firestore.rules           # 🔒 Firestore Database Security Rules
├── .env.local.example        # Environment variable templates
├── package.json              # Monorepo workspaces configuration
└── push_to_github.bat        # Convenience script for pushing code
```

---

## 🏗️ Architectural Overview

### 1. The Frontend (`/frontend`)
The presentation layer is built with **React** using the **Vite** bundler for blazing-fast development. It incorporates dynamic components like `GisMapViewer` for mapping land parcels, `WorkflowTimeline` for tracking acquisition stages, and `CompensationCalculator` for citizen-facing estimates. 

### 2. The Legacy Backend (`/backend`)
An older **Express.js** system that relied on local JSON files (`data/projects.json`, `data/parcels.json`) to serve data. It is currently being deprecated in favor of Firebase and Next.js Serverless functions.

### 3. Modern Serverless API (`/app/api`)
The backend is migrating to **Next.js API Routes** running on Vercel/Firebase. 
- **RBAC Security:** API routes are protected by a custom `withAuth` middleware that enforces strictly verified Firebase Custom Claims (`central_admin`, `slao_district`, `state_revenue`, etc.).
- **Valuation Engine:** The core of the system is the `calculate-award` route. It fetches data from Firestore, pipes it through the statutory RFCTLARR mathematical utilities (`valuationEngine.ts`), performs atomic batch writes to store the generated Award, and maintains a strict `audit_logs` history.

### 4. Database Schema & Security (`/types` & `firestore.rules`)
- Strict TypeScript schemas map exactly to what is allowed in Firestore (`CadastralParcel`, `Project`, `User`, `AuditLog`).
- The `firestore.rules` file ensures that users cannot directly mutate sensitive entities (like `CadastralParcel` statuses) without possessing the proper government custom claims (e.g. `slao_district`), protecting the integrity of the data at the database layer.
