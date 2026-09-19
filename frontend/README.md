# Nestera PropTech — Next.js Frontend

A high-fidelity Next.js application for the Nestera PropTech platform, converted directly from the single-page prototype into modern, reactive React components with seamless Express + MongoDB backend integration.

## Features
- **Landing Page**: Location, property type, and budget search with live showcase property highlights and zero-brokerage guarantees.
- **Find a Space (Discovery)**: Dynamic multi-parameter filtering, interactive neighborhood map pins, transparency ratings, and bookmarking.
- **Property Details Modal**: High-res image gallery, radical living cost simulator with interactive electricity range slider, and transparency breakdown bars.
- **Roommate Matching Deck**: Tinder-style swipe cards (Pass, Match, Info) with mutual match celebration modal and grid view toggle.
- **Tenant Hub (Dashboard)**: Rent due countdown, quick UPI rent payment modal with instant GST receipt generation, and shared household expense ledger.
- **Maintenance & Repairs**: Step-by-step issue tracker with SLA timeline, verified technician ETA, and rapid dispatch modal.
- **Fair Rent Valuation Tool**: Real-time algorithmic market rent calculator based on locality, carpet area, furnishing, and amenities.
- **Plain-English Legal Agreement**: Archaic legalese vs plain-English clause translator, DigiLocker Aadhaar eSign authentication, and PDF download preview.
- **Owner / Host Hub**: Portfolio KPIs (Occupancy, gross revenue, on-time collection), units management table, and new property listing modal.
- **Notification Drawer**: Slide-out alert center with real-time unread counter and deep-link routing.
- **User Profile Modal**: Government DigiLocker Aadhaar KYC verified credentials badge.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Library**: React 18
- **Typography**: Plus Jakarta Sans
- **Styling**: Vanilla CSS Design Tokens (Indigo `#4F46E5`, Emerald `#10B981`, Amber, Rose, Cyan)
- **Backend & Cloud DB Integration**:
  - Express REST API (`http://localhost:5000/api`)
  - Direct **Supabase Cloud (PostgreSQL)** client (`@supabase/supabase-js`)
  - Automatic graceful in-memory mock fallback if both services are unreachable
- **Data Flow**: Reactive Context (`AppContext`) with multi-tier failover

## Setup & Running

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
`.env.local` is preconfigured for both local Express and cloud Supabase:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase Cloud Project Configuration
NEXT_PUBLIC_SUPABASE_URL=https://flzbgvhampusyphopqax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
