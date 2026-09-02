# Rashtriya BhoomiSetu - User Walkthrough & Testing Flow

Welcome to the Rashtriya BhoomiSetu platform! This document serves as a comprehensive, step-by-step manual for newcomers, judges, or testers visiting the website. It outlines the exact flow to experience the full capabilities of our National Land Acquisition & Management System.

## Phase 1: Initial Entry & Authentication

1. **Visit the Application**: Open the deployed Vercel URL in your browser.
2. **Landing / Login Page**: You will be greeted by the authentication portal. 
   - **Test Action**: Log in using the provided test credentials (e.g., as an SLAO - Special Land Acquisition Officer or Central Admin).
3. **The Global Dashboard**: Upon successful login, you will land on the main global dashboard. 
   - **What you will see**: A high-level overview of all active land acquisition projects, macro KPIs (budget disbursed, affected parcels, active disputes), and system health metrics.
   - **Test Action**: Hover over the bottom-left sidebar to view the "Live Synced" database socket connection and the "RFCTLARR Compliant" statutory audit badge.

## Phase 2: Project Management & Diagnostics (`/projects`)

1. **Navigate to Projects**: Click on "Projects" in the left sidebar.
2. **Select a Project**: Choose a project from the top dropdown (e.g., "NH-44-DELHI-AMRITSAR").
3. **Macro KPI Strip**: Observe the key metrics changing dynamically based on the selected project.
4. **Village Breakup Table**: Scroll down to see the tabular breakdown of affected villages.
   - **What to test**: Click on table headers (Village, Circle Rate, Total Area) to test the dynamic sorting. Use the search bar to filter by village name or Khasra (Survey) number.
5. **Bottleneck Diagnostics**: Look for the automated LAPSE alerts (e.g., "Section 19 Deadline Risk"). This demonstrates the system's compliance watchdog actively tracking statutory deadlines.

## Phase 3: Spatial Analytics & Cadastral Mapping (`/gis-map`)

1. **Navigate to GIS Map**: Click on "Spatial Analytics" or "GIS Map" in the sidebar.
2. **Map Interface**: You will see a fully interactive map rendering cadastral boundaries (land parcels) overlaid on satellite/street views.
3. **Filter & View**: Use the top control bar to filter parcels by "All Parcels", "Only Affected", or "High Risk".
4. **Khasra Interaction**: 
   - **Test Action**: Click on any highlighted land parcel on the map.
   - **What happens**: The **Khasra Detail Drawer** slides out from the right. It displays the parcel's precise area, owner details, calculated base compensation, and DBT (Direct Benefit Transfer) status.

## Phase 4: Valuation & Compensation Engine (`/valuation`)

1. **Navigate to Valuation**: Click on "Valuation Engine" in the sidebar.
2. **Market Value Determination**: 
   - **Test Action**: Use the Sec 26 Market Value Calculator. Input different Base Circle Rates and Registered Sale Deed Averages.
   - **What to observe**: The engine automatically picks the higher value, applies the appropriate rural/urban distance multiplier, and computes the final market value in real-time.
3. **First & Second Schedule Entitlements**: 
   - Observe how the engine automatically adds the mandatory 100% Solatium and 12% statutory interest (from Sec 11 to Sec 23 dates) to generate the Final Award.
4. **Finalize Award**: Test the "Finalize & Seal Award" action, which prepares the data for PFMS/DBT gateway integration.

## Phase 5: Dispute Resolution & Grievance Management (`/objections`)

1. **Navigate to Objections**: Click on "Grievances & Objections" in the sidebar.
2. **Landowner Claims**: You will see a list of objections filed by citizens regarding area mismatch, valuation disputes, or heirship conflicts.
3. **Adjudication Panel**: 
   - **Test Action**: Select an objection from the list. The right-hand detail panel will populate with the claim grounds, attached evidence (deeds, maps), and hearing history.
   - **SLAO Action**: Test the "Approve Compensation Revision" or "Reject Dispute" buttons. Note the mandatory requirement for SLAO justification notes before closing a dispute.

## Phase 6: Public Transparency & Document Sealing (`/citizen-portal` & `/gazette-vault`)

1. **Citizen Portal (`/citizen-portal`)**: 
   - **Flow**: Imagine switching roles to a farmer or landowner. Enter a Khasra/Aadhar number to securely look up acquisition status, compensation breakdown, and DBT transfer stage.
2. **Gazette Vault (`/gazette-vault`)**: 
   - **Test Action**: Navigate to the Vault. This module demonstrates our anti-tamper security.
   - **Verification**: Input a document ID and its SHA-256 hash to test the cryptographic verification tool. It will query the immutable ledger and return whether the document is "VERIFIED_ORIGINAL" or "TAMPERED_INVALID".

---
*Following this flow ensures you interact with all core pillars of BhoomiSetu—from bureaucratic tracking and GIS analytics, to automated valuation, grievance redressal, and cryptographic transparency.*
