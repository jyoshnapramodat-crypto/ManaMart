# 🛒 ManaMart — Mana Ooru. Mana Market.
### *Your Entire Neighborhood, Delivered.* (Powered by LocalLoop)

![License](https://img.shields.io/badge/License-MIT-orange.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Node](https://img.shields.io/badge/Node-v20+-green.svg)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v3.4-teal.svg)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black.svg)
![Languages](https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81-red.svg)

---

## 🌟 Executive Vision

**ManaMart** (powered by the **LocalLoop** platform) is a full-stack, scalable, modern, hyperlocal commerce and delivery platform specifically architected to empower neighborhood shops, restaurants, kirana stores, pharmacies, bakeries, and local services in Indian towns and tier-2/3 cities.

Combining the best paradigms of:
- **Swiggy & Zomato**: Food discovery, rich appetizing cards, dish customizations, ETA badges.
- **Blinkit & Instamart**: Express 15-minute essentials, clean +/- steppers, instant cart drawer.
- **Rapido**: Independent delivery partner radar, per-km fare computation, live navigation.
- **Instagram & YouTube**: Store updates, stories ring, flash discounts, new arrival feeds, and subscription channels.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Axios, React Router DOM v6, React-i18next (English & Telugu), Canvas Confetti |
| **Backend** | Node.js, Express.js, RESTful API (`/api/v1`), Socket.IO (WebSocket live updates), JWT Authentication (Access + Refresh tokens), Node-Cron, Morgan, UUID |
| **Database** | MongoDB Atlas / Mongoose with GeoJSON `2dsphere` indexes + Resilient hybrid repository memory fallback for 100% zero-configuration local runs |
| **Payments** | Razorpay integration flow (UPI, Card, Net Banking, COD) with backend verification and security handshakes |
| **Location & Maps** | Interactive vector route visualizer, Haversine distance calculations, dynamic delivery fees & ETA estimation |

---

## 👥 User Roles & Experiences

ManaMart features a built-in **Test Simulator Toolbar** at the top of the interface allowing instant 1-click role switching without friction:

1. **Customer**:
   - Hyperlocal GPS location detection and locality selector (Hyderabad, Vijayawada, Visakhapatnam, Warangal, Tirupati).
   - Category navigation: Food & Restaurants, Kirana, 24x7 Medicines, Bakeries, Fresh Flowers, Parcel Courier, Home Services.
   - Follow favorite stores to receive real-time updates and exclusive coupons.
   - Setup Automated Recurring Monthly Shopping lists with merchant stock verification.
   - Razorpay payment simulation and live order tracking with 4-digit Delivery OTP.
   - English & Telugu multilingual switch.

2. **Merchant / Business Owner**:
   - Store command center with live status toggle (Accepting Orders vs Closed).
   - Regulatory Compliance checklist: 14-digit FSSAI food safety license, Drug License, GSTIN, PAN verification.
   - Product catalog & menu management with instant In-Stock / Out-of-Stock toggles.
   - Live incoming order management (Confirm -> Kitchen Preparing -> Ready for Rider).
   - Social updates publisher: Announce weekend specials and promo codes to followers.
   - Dine-in table reservations management.

3. **Delivery Partner (Rider)**:
   - Rider portal with Online / Offline availability switch.
   - Verified Driving License and vehicle RC badge.
   - Real-time nearby delivery radar with proposed payouts (e.g. ₹55/trip) and counter-offer options.
   - Turn-by-turn pickup and drop-off instructions.
   - Mandatory Customer Delivery OTP verification before marking completed.
   - Today's earnings wallet with trip logs.

4. **Administrator**:
   - Platform GMV, total orders, commission revenue, and active merchant counters.
   - Merchant Verification Queue: Inspect submitted FSSAI certificates and trade licenses. Approve or reject with remarks.
   - Rider Credential Queue: Validate driving licenses and vehicle insurance.
   - Platform Orders supervisor with 1-click customer dispute refund processing.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ManaMart.git
cd ManaMart

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Environment Setup
The project comes pre-configured with default development settings. You can review or adjust `.env` in `server/.env`:
```env
PORT=5050
CLIENT_URL=http://localhost:5173
JWT_SECRET=localloop_jwt_secret_dev_2026
```

### 3. Run Development Servers
To start both the Express backend API and Vite frontend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5050/api/v1`
- Socket.IO Server: `http://localhost:5050`

Alternatively, run each service independently:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

### 4. Production Single-Server Mode
You can build the frontend and serve both the app and APIs from the single Express server:
```bash
npm run build
npm start --prefix server
```
Access the application at `http://localhost:5050`.

---

## 🧪 Testing Key Features

1. **Placing an Order**:
   - Browse the homepage, click on *Swagath Grand Authentic Kitchen*.
   - Add "Special Hyderabadi Chicken Dum Biryani" to cart.
   - Click Cart -> apply coupon `WELCOME50` -> click *Proceed to Pay*.
   - Complete payment via UPI in the Razorpay gateway modal.
   - Note the **4-digit Delivery OTP** generated on the tracking page.

2. **Rider Fulfillment Workflow**:
   - Click **Rider** on the top Test Simulator bar.
   - View the active delivery task, click *Verify OTP & Complete*.
   - Enter the customer's 4-digit code (or master demo code `1234`).
   - Watch the payout get deposited directly into the Rider's wallet!

3. **Automated Monthly Shopping**:
   - Navigate to **Monthly Lists** in the top navigation.
   - View pre-configured *Monthly Kirana & Pantry Ration*.
   - Click *Execute Monthly Check Now* to simulate automated subscription dispatch.

4. **Follow / Social Updates**:
   - Visit the **Feed** page to view posts and announcements published by neighborhood businesses.
   - Click the heart icon to like or tap *Order Now*.

5. **Regulatory Compliance Audit**:
   - Click **Admin** on the Test Simulator toolbar.
   - Open *Merchant Verification Queue* and *Rider Credential Queue*.
   - Review submitted FSSAI licenses and approve with 1 click.

---

## 📂 Project Directory Structure

```
ManaMart/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, BottomNav, CartDrawer, PaymentModal, LocationModal
│   │   ├── context/          # AuthContext, LocationContext, CartContext
│   │   ├── locales/          # English (en.json) & Telugu (te.json) translations
│   │   ├── pages/
│   │   │   ├── customer/     # HomePage, MerchantDetails, SocialFeed, RecurringLists, Tracking
│   │   │   ├── merchant/     # MerchantDashboardPage (Orders, Menu, Posts, Compliance)
│   │   │   ├── rider/        # RiderDashboardPage (Radar, Tasks, OTP Verify, Wallet)
│   │   │   └── admin/        # AdminDashboardPage (GMV, Verification Queues, Orders)
│   │   ├── services/         # Axios API client & Socket.IO client
│   │   ├── App.jsx           # Master router & providers
│   │   └── main.jsx          # Root initialization
│   ├── tailwind.config.js    # Design system palette & typography
│   └── vite.config.js        # Vite config & API proxying
├── server/
│   ├── src/
│   │   ├── config/           # Database & JWT configurations
│   │   ├── controllers/      # Auth, Discovery, Order, Follow, Recurring, Merchant, Rider, Admin
│   │   ├── routes/           # RESTful modular routers (/api/v1/...)
│   │   ├── sockets/          # Socket.IO real-time handlers
│   │   ├── jobs/             # Automated recurring scheduler
│   │   ├── utils/            # MockDbStore, Haversine distance, OTP generator
│   │   └── app.js            # Express app & static file serving
│   └── server.js             # HTTP & Socket.IO server startup
├── docs/
│   ├── architecture.md       # High-level system architecture
│   ├── database-design.md    # MongoDB collections & Mongoose schemas
│   └── api-documentation.md  # Detailed RESTful endpoint specification
└── package.json
```

---

## 🇮🇳 Telugu Regional Tagline
> **మన ఊరు. మన మార్కెట్. మీ పరిసరాలు, మీ ఇంటికే.**  
> *Mana Ooru. Mana Market. Your Entire Neighborhood, Delivered.*

