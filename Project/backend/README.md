# Nestora PropTech — Express & MongoDB Backend

Robust, scalable REST API for the Nestora PropTech platform, providing full data services for transparent student & youth housing, roommate matching, maintenance ticketing, split expenses, and owner portfolios.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: 
  - **Supabase Cloud (PostgreSQL)**: Primary cloud database with RLS and realtime readiness
  - **MongoDB (Mongoose)**: Local / containerized database alternative
- **Utilities**: CORS, Dotenv, Morgan, `@supabase/supabase-js`

## Setup & Running

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
A `.env` file is preconfigured with Supabase and MongoDB credentials:
```env
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Supabase Cloud Database Configuration
SUPABASE_URL=https://flzbgvhampusyphopqax.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional Local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/nestora_db
```

### 3. Seed MongoDB (Optional)
Populate your local MongoDB database with the complete realistic Indian rental demo dataset (Het Darji, SG Highway, Nirma University, GIFT City, etc.):
```bash
npm run seed
```

### 4. Start Server
Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run at `http://localhost:5000`.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/properties` | Search & filter properties (city, type, budget, amenities, sorting) |
| `GET` | `/api/properties/:id` | Detailed property data & cost breakdown |
| `POST` | `/api/properties/schedule-visit` | Book physical or virtual property tour |
| `POST` | `/api/properties/apply` | Submit 0-brokerage rental application |
| `POST` | `/api/properties/contact-owner` | Direct WhatsApp/in-app inquiry to landlord |
| `GET` | `/api/roommates` | List verified roommates with compatibility scores |
| `POST` | `/api/roommates/swipe` | Roommate swipe action (`match` or `pass`) |
| `GET` | `/api/expenses` | List shared household split expenses |
| `POST` | `/api/expenses/split` | Create new equally split utility or grocery bill |
| `POST` | `/api/expenses/settle-all` | Settle all pending balances |
| `GET` | `/api/tickets` | Maintenance ticket tracker with step timeline |
| `POST` | `/api/tickets` | Register new maintenance or repair issue |
| `GET` | `/api/notifications` | Notifications center with unread count |
| `PATCH` | `/api/notifications/:id/read` | Mark single notification as read |
| `PATCH` | `/api/notifications/mark-all-read` | Mark all notifications as read |
| `GET` | `/api/owner/dashboard` | Landlord portfolio KPIs and properties table |
| `POST` | `/api/owner/properties` | List new residential or commercial unit |
| `POST` | `/api/valuation/calculate` | Algorithmic fair rental price calculation |
| `GET` | `/api/agreement/clauses` | Plain-English side-by-side legal clauses |
| `POST` | `/api/agreement/sign` | Aadhaar DigiLocker eSign simulation |
| `POST` | `/api/agreement/clarification` | Ask legal inquiry on contract clause |
