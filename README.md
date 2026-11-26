# ChargeNear – Peer-to-Peer EV Charging Marketplace
> *"Every Plug Can Power a Ride."*

ChargeNear is a modern full-stack peer-to-peer EV charging marketplace that connects electric two-wheeler riders with nearby homeowners, shops, cafes, offices, and businesses equipped with compatible, tested EV charging facilities in Chennai, Tamil Nadu.

---

## 🌟 Key Features

### 🛵 EV Rider Experience
- **Interactive Charger Radar**: Leaflet OpenStreetMap featuring real-time pins, location cards, and radius filters.
- **Geographic Proximity via Haversine Formula**: Exact distance calculated from the rider's coordinates.
- **Filter by Compatibility**: Ordinary 16A 3-Pin socket vs Dedicated Level 2 AC Wallbox, price, power, rating, and venue category.
- **Conflict-Free Slot Booking**: Backend engine prevents double bookings and manages availability slots.
- **Transparent Cost Estimator**: Clear breakdown of hourly rate, duration, 5% platform fee, and GST.
- **Simulated Payment Sandbox**: Razorpay test mode and instant simulated payment confirmation with digital booking passes.
- **Booking Management & Reviews**: Track status (*Pending*, *Confirmed*, *Completed*, *Cancelled*) and rate hosts.

### 🏠 Charging Host Experience
- **List Any Safe Outlet**: Homes, cafes, parking bays, and retail stores can register charging points.
- **Electrical Safety First**: Mandatory declaration of grounding resistance, RCCB/RCBO breaker protection, and socket classification.
- **Earnings & Payout Console**: 95% net payout to host UPI ID with interactive monthly earnings trend visualizer.
- **Booking Request Queue**: One-click **Accept** or **Decline** for incoming rider reservations.
- **Listing Management**: Pause, resume, edit pricing, or view per-plug revenue metrics.

### 🛡️ Admin Governance & Safety Inspection
- **Safety Verification Gate**: All new charging points require Admin audit before appearing on the public map.
- **Platform Analytics**: Track GMV, total active riders, verified hosts, and platform commission.
- **User & Dispute Management**: Moderate users, inspect bookings, and resolve safety inquiries/complaints.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide React Icons, Leaflet & React-Leaflet, React Hot Toast |
| **Backend** | Node.js, Express.js, REST API Architecture, JWT Authentication, Morgan Logger |
| **Database & ORM** | PostgreSQL 18, Prisma ORM |
| **Payments** | Simulated Razorpay Test Mode & Instant Sandbox Verification |
| **Maps & Geo** | Leaflet + OpenStreetMap CartoDB Tiles, Haversine Distance Calculation |

---

## 📋 Project Structure

```
chargeshare/
├── client/                     # Vite + React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ChargerCard, ChargerMap, SafetyNoticeBanner
│   │   ├── context/            # AuthContext (JWT, session, role helpers)
│   │   ├── pages/              # 18 Distinct Application Pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RiderDashboardPage.jsx
│   │   │   ├── FindChargersPage.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── ChargerDetailsPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── BookingHistoryPage.jsx
│   │   │   ├── HostDashboardPage.jsx
│   │   │   ├── AddChargerPage.jsx
│   │   │   ├── ManageListingsPage.jsx
│   │   │   ├── HostEarningsPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/           # API Client with token handling
│   │   ├── App.jsx             # Route definitions & ProtectedRoute guards
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Express REST Backend & Prisma Database
│   ├── prisma/
│   │   └── schema.prisma       # Database models (User, HostProfile, ChargingLocation, etc.)
│   ├── src/
│   │   ├── lib/prisma.js       # Prisma client singleton
│   │   ├── middleware/auth.js  # JWT auth & role authorization
│   │   ├── routes/             # auth, chargers, bookings, host, admin, reviews, notifications
│   │   ├── utils/distance.js   # Haversine distance calculator
│   │   ├── prisma/seed.js      # Seed data (10 Chennai chargers, 5 hosts, 10 riders, admin)
│   │   └── index.js            # Express app server entry
│   ├── test-e2e.js             # Automated 15-step integration test suite
│   ├── .env                    # Configured for PostgreSQL 18
│   └── package.json
│
├── .env.example
├── package.json                # Root concurrent runner scripts
└── README.md
```

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: Running locally or via Docker / cloud instance (e.g. Supabase, Neon, Railway)

### 2. Configure Environment Variables
Create or verify `.env` in `server/`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/chargenear?schema=public"
JWT_SECRET="chargenear_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
RAZORPAY_KEY_ID="rzp_test_chargenear_sample"
RAZORPAY_KEY_SECRET="mock_chargenear_secret"
NODE_ENV="development"
```

### 3. Install Dependencies
From the root directory:
```bash
# Install root, backend, and frontend packages
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 4. Database Setup & Seed Sample Data
Initialize tables in PostgreSQL and load 10 verified charging locations in Chennai:
```bash
# Sync Prisma schema to PostgreSQL
npm run db:push

# Seed database with realistic Chennai demo data
npm run db:seed
```

### 5. Run the Application
Start both Express backend (Port 5000) and Vite frontend (Port 5173) concurrently:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## ⚡ Instant One-Click Demo Personas

On the Login page and in the top navigation bar, quick switcher buttons let you experience each perspective without typing credentials:

| Role | Demo Credentials | Focus / Test Capabilities |
|---|---|---|
| **⚡ EV Rider** | `rider@chargenear.com` / `DemoPass@123` | Search plugs, calculate cost, book slot, simulated payment, rate hosts |
| **🏠 Charging Host** | `host@chargenear.com` / `DemoPass@123` | View earnings dashboard, accept/reject bookings, list new plugs |
| **🛡️ Platform Admin** | `admin@chargenear.com` / `AdminPass@123` | Audit pending verification queue, manage users, platform GMV |

---

## 🧪 Automated End-to-End Test Suite

Run the full integration test suite verifying all 15 core user journeys:
```bash
node server/test-e2e.js
```
Expected output:
```
  ✅ PASS: 1. System Health API is operational
  ✅ PASS: 2. Rider Demo Login
  ✅ PASS: 3. Host Demo Login
  ✅ PASS: 4. Admin Demo Login
  ✅ PASS: 5. Fetch Charging Points with Haversine distance
  ✅ PASS: 6. Transparent Cost Estimation with 5% Platform Fee
  ✅ PASS: 7. Slot availability check verifies vacant slot
  ✅ PASS: 8. Booking Created with status PENDING
  ✅ PASS: 9. Conflict Prevention Engine rejects overlapping double-booking (409 Conflict)
  ✅ PASS: 10. Simulated Payment transitions booking to CONFIRMED
  ✅ PASS: 11. Review submitted and location rating recalculated
  ✅ PASS: 12. Host lists charger with PENDING admin verification
  ✅ PASS: 13. Admin approves charger and publishes live to map
  ✅ PASS: 14. Admin Platform Metrics & Revenue accounting
========================================
E2E Test Results: 15 Passed, 0 Failed
========================================
```

---

## 🛡️ Electrical Safety & Compatibility Charter

Not all electric two-wheelers support direct connection to EV car charging stations. ChargeNear strictly observes:
1. **Socket Distinction**: Ordinary 16A 3-pin household outlets require the rider to use their certified OEM portable charger. They are never labeled as certified fast chargers.
2. **Dedicated EVSE**: Clearly indicates permanent Level 2 Wallbox AC units.
3. **Copper Earthing**: Requires earth resistance < 3 Ohms and independent C-curve MCB + 30mA RCCB protection.
4. **Admin Verification**: Every listing undergoes administrative inspection before publication on the map.

---

## 📄 License
ISC License © 2026 ChargeNear Technologies. Built for sustainable EV mobility.

