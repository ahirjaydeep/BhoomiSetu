# BhoomiSetu (भूमिसेतु) — Real-Time National Land Acquisition & Management System

> **Smart India Hackathon 2026 | Problem Statement ID: 26016**  
> **Client / Organization**: Ministry of Rural Development — Department of Land Resources (DoLR), Government of India  
> **Statutory Compliance**: **RFCTLARR Act, 2013** (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act) & **PM GatiShakti National Master Plan**.

---

## 📌 Executive Summary
**BhoomiSetu** is an end-to-end digital governance platform that automates and monitors the entire land acquisition lifecycle across India. From initial project proposal submission by Land Requiring Bodies (e.g. NHAI, Indian Railways, DMRC) to final physical possession and Direct Benefit Transfer (DBT) compensation payout to project-affected landowners.

---

## 🏛️ Multi-Stakeholder Role-Based Access Control (RBAC)
The system includes built-in persona switching to test role-specific workflows:
1. **Central Ministry (DoLR / MoRD)**: Macro-level national analytics, PM GatiShakti corridor alignment synchronization, inter-state bottleneck resolution, and fund allocation monitoring.
2. **State Revenue Department**: State gazette publication approvals (Sec 4 SIA, Sec 11 Preliminary Notification, Sec 19 Final Declaration), state multiplier factor configuration.
3. **District Administration / District Collector & SLAO**: Cadastral parcel validation, Joint Measurement Survey (JMS), Section 15 objection public hearings, Section 23/26 Award determination, and Section 38 Possession Certificates.
4. **Land Requiring Body (LRB - NHAI, DFCCIL, NTPC)**: New proposal submission, alignment GeoJSON mapping, compensation escrow deposit, real-time Right-of-Way (RoW) possession tracking.
5. **Project Affected Families (PAF) / Citizen & Farmer**: Khasra/Survey number search, land title compensation passbook, DBT payout status, and Section 15 online objection filing.

---

## ⚡ Key Modules & Features

### 1. RFCTLARR Act 2013 7-Stage Workflow Pipeline
- **Stage 1**: Proposal Submission & Administrative Approval (LRB -> DoLR)
- **Stage 2**: Section 4 Social Impact Assessment (SIA) & Expert Review
- **Stage 3**: Section 11 Preliminary Notification (Official Gazette Publication)
- **Stage 4**: Section 15 Hearing of Objections & District Collector Inquiry
- **Stage 5**: Section 19 Final Declaration & Resettlement and Rehabilitation (R&R) Scheme
- **Stage 6**: Section 23/26 Valuation, 100% Solatium Award & 12% PA Interest Calculation
- **Stage 7**: Section 38 Compensation Payout (DBT) & Possession Handover Certificate

### 2. Interactive GIS Cadastral Map (Leaflet)
- Linear project corridor Right-of-Way (RoW) polyline overlays.
- Polygonal Cadastral Khasra plots color-coded by acquisition status:
  - 🟢 **Possession Handed Over** (Sec 38 Form 16 issued)
  - 🔵 **Award Determined / DBT Processing** (Sec 23/26)
  - 🟡 **Under Inquiry / Section 15 Objection**
  - 🔴 **Court Stay / Active Litigation**
- Interactive parcel inspector popup: Owner name, masked Aadhaar, area in Hectares & Bigha, circle rate, structure/tree valuation, total award amount, and DBT transaction ID.
- Switchable Satellite Imagery & Standard OpenStreetMap layers.

### 3. Statutory Compensation & Solatium Award Calculator
- Calculates compensation under the **First Schedule of RFCTLARR Act, 2013**:
  - $\text{Base Market Value} = \max(\text{Circle Rate}, \text{Average 3-Yr Sale Deed}) \times \text{Area}$
  - $\text{Multiplied Value} = \text{Base Value} \times \text{Multiplier Factor (1.0 to 2.0)}$
  - $\text{Attached Assets} = \text{Structure Valuation (Houses, Wells)} + \text{Timber / Standing Crop Valuation}$
  - $\text{Mandatory Solatium} = 100\% \times (\text{Multiplied Value} + \text{Attached Assets})$
  - $\text{Additional Interest} = 12\% \text{ per annum from Sec 11 notification date}$
- Calculates **Second Schedule R&R Grants**:
  - Subsistence allowance (Rs 36,000 / family)
  - Transportation / shifting grant (Rs 50,000)
  - One-time resettlement allowance (Rs 50,000)
  - Cattle shed / petty shop grant (Rs 25,000)

### 4. AI Decision Support & Statutory Bottleneck Early Warning Engine
- Automated **12-Month Expiry Countdown Alert** between Section 11(1) and Section 19(1) to prevent statutory lapse under Section 19(7).
- Root-cause bottleneck breakdown (Court Stays, Valuation Disputes, RoW Possession Gaps).
- Automated recommendations for District Collectors and Central Ministries.

### 5. Digital Gazette & Tamper-Proof Cryptographic Vault
- Generates Section 11 Extraordinary Gazette Notifications and Section 38 Possession Certificates (Form 16).
- Every issued certificate and award is sealed with a **SHA-256 cryptographic hash** ensuring blockchain-grade tamper detection.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Leaflet & React-Leaflet GIS, Recharts.
- **Backend**: Node.js, Express REST API, crypto SHA-256 verification module.
- **Data Layer**: Preloaded Indian infrastructure corridors (Delhi-Amritsar Expressway, Eastern Dedicated Freight Corridor, Rewa Mega Solar Park, Delhi Metro Phase-IV) with cadastral GeoJSON coordinates.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 2. Start Backend Server
```bash
cd backend
npm install
npm start
# Server starts on http://localhost:5000
```

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
# Vite server starts on http://localhost:3000
```

### 4. Open in Browser
Open `http://localhost:3000` to interact with the full prototype.
