# ManaMart / LocalLoop — System Architecture

> **Mana Ooru. Mana Market. Your Entire Neighborhood, Delivered.**

## 1. High-Level System Overview

ManaMart (powered by the LocalLoop platform) is a multi-tier, hyperlocal full-stack commerce and service ecosystem designed for Indian towns, tier-2/3 cities, and urban neighborhoods.

The architecture comprises:
- **Mobile-First Client (React + Vite + Tailwind + Framer Motion)**
  - Responsive layout with bottom navigation on mobile devices and desktop sidebar.
  - Multi-role UI supporting Customers, Merchants, Delivery Partners (Riders), and Admins.
  - Multilingual internationalization (English & Telugu) out of the box.
  - Real-time updates via Socket.IO client.
  - Interactive map integration with route visualization, radar search, and delivery tracking.
- **RESTful + Real-Time Backend (Node.js + Express.js + Socket.IO)**
  - Modular layered architecture: Controllers, Services, Models, Sockets, Jobs, Middleware.
  - JWT Access Token + Refresh Token rotation.
  - Multi-category order processing engine with coordinated sub-order settlement.
  - Automated recurring monthly shopping list engine (Cron & Idempotent dispatch).
  - Hybrid rider assignment protocol: broadcast, auto-match, counter-offers, and admin manual dispatch.
  - OTP verification system for secure handoffs.
- **Persistence Layer (MongoDB Atlas / Mongoose + Resilient Memory Fallback)**
  - GeoJSON 2dsphere indexing for hyperlocal radius search (1km - 15km).
  - Resilient hybrid storage: Works seamlessly whether connected to live MongoDB Atlas or running in local dev mode.

---

## 2. Multi-Role Ecosystem & Workflows

### A. Customers
1. **Hyperlocal Discovery**: Auto-detects GPS coordinates or allows manual locality selection across AP/Telangana cities (Hyderabad, Vijayawada, Vizag, Warangal, Tirupati, etc.) and custom zones.
2. **Category-Aware Catalog**: Food & Restaurants, Groceries & Supermarkets, Local Kirana, 24x7 Pharmacies, Bakeries, Flowers, Electronics, Fashion, Parcel Delivery, and Home Services.
3. **Follow & Social Updates**: Follow favorite neighborhood shops. View stories/updates, new stock arrivals, daily meal specials, and exclusive subscriber deals.
4. **Recurring Shopping Lists**: Set up scheduled lists (Monthly/Weekly) with merchant stock confirmation, substitution alternatives, and customer approval before dispatch.
5. **Multi-Store Checkout**: Razorpay mock/live integration, order breakdown, sub-orders, and secure 4-digit Delivery OTP.
6. **Live Tracking**: Visual delivery stages, rider position updates, and estimated arrival time.

### B. Merchants
1. **Onboarding & Verification**: Business profile, location coordinates, category-specific regulatory compliance (FSSAI license for food, Drug License for pharmacies, GSTIN, Trade license).
2. **Catalog & Inventory**: Category tags, price, discount, veg/non-veg tags, in-stock/out-of-stock toggles.
3. **Order Lifecycle**: Accept orders, mark "Preparing", "Ready for Pickup", or request LocalLoop rider.
4. **Social Hub**: Publish image posts, special offers, flash discounts, and store notices directly to followers.
5. **Table Reservations**: Accept or manage dine-in reservations with date, time, and party sizes.
6. **Settlement & Analytics**: Daily sales, platform commission calculation, net payout.

### C. Delivery Partners (Riders)
1. **Onboarding & Verification**: Identity proof, Driving License (for motorized vehicles), Vehicle RC, Insurance verification.
2. **Radar & Availability**: Toggle Online/Offline. Broadcast alerts for nearby unassigned orders.
3. **Counter-Offer Negotiation**: Accept delivery task at base fare or place a fair payout counter-offer.
4. **Step-by-Step Delivery**: Navigate to Merchant -> Arrived at Merchant -> Verify Pickup -> Navigate to Customer -> Verify Customer OTP -> Complete Delivery.
5. **Earnings Wallet**: Daily earnings, tips, delivery history.

### D. Administrators
1. **Compliance Queue**: Review pending merchant and rider verification requests with document inspection, approve, reject, or request changes.
2. **Serviceability & Zones**: Configure active cities, delivery radius, base delivery fees, and platform commission rates.
3. **Dispute & Refund Desk**: Handle order escalations, customer refunds, and audit trails.
4. **Platform Analytics**: Gross Merchandise Value (GMV), active riders, pending orders, and commission revenue.

---

## 3. Technology Stack Specification

| Tier | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Axios, React Router v6, i18next (English & Telugu), Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, Bcrypt, Node-Cron, Morgan, UUID |
| **Database** | MongoDB Atlas, Mongoose ODM with GeoJSON 2dsphere indexing, Dual-mode in-memory repository fallback |
| **Payment Gateway** | Razorpay (UPI, Credit/Debit cards, Netbanking, COD) with backend verification |
| **Maps & Location** | Google Maps Platform / Leaflet & OpenStreetMap interactive mock with Haversine formula calculation |
