# Nestora PropTech — Full Stack Platform

Nestora is a next-generation PropTech platform designed for students, young adults, and first-time renters to find, compare, lease, share, and manage residential and commercial spaces with radical cost transparency and zero hidden brokerage.

---

## Repository Structure

```
Project/
├── backend/                  # Express & MongoDB REST API
│   ├── config/               # Database connection (config/db.js)
│   ├── controllers/          # 8 Business logic controllers
│   ├── models/               # 7 Mongoose schemas & models
│   ├── routes/               # Express REST route definitions
│   ├── seed/                 # Database seed script & initial JSON fixture
│   ├── .env                  # Preconfigured backend environment
│   ├── server.js             # Express app entry point
│   └── package.json          # Express, Mongoose, CORS, Dotenv, Morgan
│
├── frontend/                 # Next.js App Router Frontend
│   ├── public/               # Static assets & avatar images
│   ├── src/
│   │   ├── app/              # Next.js App Router (layout.jsx, page.jsx, globals.css)
│   │   ├── components/
│   │   │   ├── layout/       # Navbar, BottomNav
│   │   │   ├── common/       # ToastContainer
│   │   │   ├── views/        # 8 Full views (Landing, Discovery, Roommates, Dashboard, Maintenance, Valuation, Agreement, Owner)
│   │   │   └── modals/       # 8 Interactive modals & drawers
│   │   ├── context/          # Global React state (AppContext.jsx)
│   │   └── services/         # API client with automatic offline fallback (api.js, mockData.js)
│   ├── next.config.js        # Next.js configuration
│   └── package.json          # Next.js dependencies
│
└── Project-3/                # Reference original prototype
    ├── css/style.css
    ├── js/app.js
    ├── js/data.js
    └── index.html
```

---

## Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- **Supabase**: Cloud database is **already live and connected** (`flzbgvhampusyphopqax.supabase.co`) with all tables and data seeded!
- **MongoDB** (Optional): The backend and frontend automatically operate seamlessly with Supabase Cloud and local fallbacks if MongoDB is not running locally.

### 1. Launch Backend (Express + Supabase / MongoDB)
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.
- Connects automatically to **Supabase Cloud PostgreSQL**!
- Optional: to seed local MongoDB if running, run `npm run seed`.

### 2. Launch Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.
- Connects directly to Supabase Cloud or via Express API, with instant offline fallback.

---

## Key Features & Highlights

1. **Radical Cost Transparency Simulator**: Interactive slider showing exact monthly electricity and living cost estimations alongside base rent.
2. **AI Roommate Matching**: Tinder-style swipe cards stack with compatibility scores, habit tags, and mutual match celebrations.
3. **Tenant Hub**: Live rent due countdown, UPI payment simulation with instant GST rent receipts, and shared household expense splitting ledger.
4. **Maintenance Dispatch**: 24/7 issue registration with vendor ETA and 5-stage SLA progress timeline.
5. **Fair Rent Valuation Calculator**: Data-driven rent benchmarks based on carpet area, micro-market, and amenities.
6. **Plain-English Digital Lease**: Side-by-side legal jargon translator with Aadhaar DigiLocker eSign simulation.
7. **Landlord Portfolio Hub**: Occupancy rates, gross revenue metrics, and unit listing management.
