# UEM EATS V2 🍱

Campus Food Ordering Platform for University of Engineering & Management (UEM).

## Features
- **Shared Student & Faculty Portal**: Browse vendors, search menu items, add to cart, pay online.
- **Vendor Portal**: Live paid order reception, menu pricing & availability management, revenue analytics.
- **Secure Online Payments**: PhonePe Payment Gateway integration with backend SHA-256 checksum verification.
- **Supabase Backend**: Role-based access control, Postgres DB with Row Level Security (RLS).
- **Admin Portal**: System monitoring, user and vendor management.

## Tech Stack
- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+)
- **Backend**: Node.js, Express.js, CORS, Dotenv, Crypto
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth)
- **Payments**: PhonePe Payment Gateway (PG API)

## Quickstart
1. **Database Setup**: Execute `database/schema.sql`, `database/policies.sql`, and `database/seed.sql` in Supabase SQL editor.
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env # Add your Supabase & PhonePe keys
   npm run dev
   ```
3. **Frontend**: Open `frontend/index.html` via Live Server or static file host.
