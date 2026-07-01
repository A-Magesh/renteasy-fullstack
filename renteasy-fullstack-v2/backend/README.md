# 🏠 RentEasy — Full-Stack Property Management System

> Rent Easy. Live Easy.

A complete property management web application built with **React.js + Node.js/Express + MongoDB**.

---

## ✨ Features (All 30 Requirements)

| # | Feature | Status |
|---|---------|--------|
| 1 | Role-Based Login (Admin / Manager / Tenant) | ✅ |
| 2 | Property Dashboard with live stats | ✅ |
| 3 | Interactive Property Map (Google Maps ready) | ✅ |
| 4 | Property & Room Images | ✅ |
| 5 | Room Booking | ✅ |
| 6 | Online Rental Agreement (PDF) | ✅ |
| 7 | Security Deposit Management | ✅ |
| 8 | Automatic Rent Reminders (Email/SMS) | ✅ |
| 9 | Online Payments — UPI, Card, Net Banking | ✅ |
| 10 | Maintenance Request Tracking | ✅ |
| 11 | Visitor Management | ✅ |
| 12 | Tenant Document Vault | ✅ |
| 13 | Lease Management | ✅ |
| 14 | Smart Search | ✅ |
| 15 | Advanced Filters | ✅ |
| 16 | Analytics Dashboard (Recharts) | ✅ |
| 17 | Expense Tracking with P&L | ✅ |
| 18 | Notification Center | ✅ |
| 19 | QR Code Payments | ✅ |
| 20 | Tenant History | ✅ |
| 21 | Room Maintenance Status | ✅ |
| 22 | Invoice & Receipt Generation | ✅ |
| 23 | Multi-Property Support | ✅ |
| 24 | Feedback & Ratings | ✅ |
| 25 | Admin Reports (PDF / Excel) | ✅ |
| 26 | Dark Mode | ✅ |
| 27 | Audit Log | ✅ |
| 28 | Backup & Restore | ✅ |
| 29 | AI Chatbot | ✅ |
| 30 | Predictive Analytics | ✅ |

---

## 🏗️ Architecture

```
renteasy/
├── frontend/          ← React.js app
│   ├── src/
│   │   ├── components/    ← Layout, UI, PaymentModal
│   │   ├── context/       ← AppContext (state + local demo mode)
│   │   ├── data/          ← mockData.js (demo fallback)
│   │   ├── pages/         ← WelcomePage, PropertiesPage, etc.
│   │   └── utils/         ← api.js (all backend calls)
│   └── .env               ← REACT_APP_API_URL
│
└── backend/           ← Node.js + Express + MongoDB
    ├── models/        ← All Mongoose schemas
    ├── routes/        ← REST API endpoints
    ├── middleware/    ← JWT auth + audit logger
    └── config/        ← seed.js
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

---

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env from template
cp .env.example .env
# Edit .env — add your MongoDB Atlas URI

# Seed database (creates admin + all 6 properties)
npm run seed

# Start backend
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs on: `http://localhost:5000`

**Default admin credentials:**
```
Email:    admin@renteasy.in
Password: Admin@123
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

npm start         # development
npm run build     # production build
```

Frontend runs on: `http://localhost:3000`

> **Demo mode:** The frontend works with built-in mock data even without a backend. Just open it and explore!

---

### 3. MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Add database user (username/password)
4. Whitelist IP: `0.0.0.0/0` (for Render deployment)
5. Get connection string → paste in `backend/.env` as `MONGODB_URI`

---

## ☁️ Deploy to Render (Free)

### Backend
1. Push backend folder to GitHub repo
2. New → Web Service on Render
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env`
6. Run seed once: Shell → `node config/seed.js`

### Frontend
1. Push frontend folder to GitHub repo
2. New → Static Site on Render
3. Build command: `npm run build`
4. Publish directory: `build`
5. Set `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/register` | Register user |
| GET | `/api/properties` | List all properties |
| POST | `/api/properties` | Create property |
| GET | `/api/properties/:id` | Property details |
| GET | `/api/rooms?propertyId=` | Rooms list |
| POST | `/api/rooms` | Add room |
| GET | `/api/tenants?propertyId=` | Tenants list |
| POST | `/api/tenants` | Add tenant |
| GET | `/api/payments?propertyId=` | Payments list |
| POST | `/api/payments` | Record payment |
| GET | `/api/maintenance?propertyId=` | Maintenance list |
| POST | `/api/maintenance` | Raise request |
| GET | `/api/expenses?propertyId=` | Expenses list |
| POST | `/api/expenses` | Add expense |
| GET | `/api/dashboard` | Portfolio stats |
| GET | `/api/reports/overview` | Annual report |
| GET | `/api/audit` | Audit log |
| GET | `/api/health` | Health check |

---

## 🏘️ The 6 Properties

| # | Name | Type | City | Units |
|---|------|------|------|-------|
| 1 | Green Meadows 🌿 | Residential | Bengaluru | 18 |
| 2 | Sunrise Residency 🌅 | PG | Bengaluru | 24 |
| 3 | Royal Heights 👑 | Luxury Apts | Hyderabad | 16 |
| 4 | Lake View Villas 🏡 | Villas | Bengaluru | 8 |
| 5 | Golden Oak Apartments 🌳 | Family Apts | Chennai | 12 |
| 6 | Silver Springs 🏪 | Commercial | Bengaluru | 6 |

---

## 🎨 Design

- **Theme:** Midnight Blue Glassmorphism
- **Accent:** Electric Teal `#0EA5E9` + Gold `#EAB308`
- **Fonts:** Space Grotesk (headings) + Inter (body)
- **Charts:** Recharts (BarChart, LineChart, PieChart)

---

## 📞 Contact

**RentEasy** — Smart Property Management  
Domain: `rentease.space`  
Built with ❤️ using React + Node.js + MongoDB
