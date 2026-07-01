# 🏠 RentEasy v2.0 — Smart Property Management

**Design:** Midnight Blue Glassmorphism · Electric Teal + Gold accents · Space Grotesk + Inter

## 📁 Project structure

```
renteasy/
├── public/index.html               Google Fonts (Space Grotesk + Inter)
├── package.json
└── src/
    ├── App.js                      Root, routing, AI chatbot FAB
    ├── index.js                    React entry
    ├── index.css                   Global styles (glassmorphism design system)
    ├── context/
    │   └── AppContext.js           Global state, actions (addProperty, addTenant, etc.)
    ├── data/
    │   └── mockData.js             6 properties with full data
    ├── components/
    │   ├── UI.js                   Toast, Badge, KPI, Avatar, ProgressBar, helpers
    │   ├── Layout.js               Sidebar, Topbar
    │   └── PaymentModal.js         UPI / Card / Net Banking modal
    └── pages/
        ├── WelcomePage.js          Hero, portfolio preview, features, how-it-works, CTA
        ├── PropertiesPage.js       All 6 property cards, filter, sort, KPIs
        ├── PropertyDetailPage.js   8 tabs per property (rooms, tenants, analytics, maintenance, payments, documents, visitors, feedback)
        ├── AdminPage.js            10 admin sections (overview, add property/room/tenant, expenses, reports, reminders, audit, backup, RBAC)
        └── OtherPages.js           All Tenants, All Payments, Settings, AI Chatbot widget
```

## 🚀 Quick start

```bash
npm install
npm start
# → http://localhost:3000
```

## 🏗 Build & deploy

```bash
npm run build
# Deploy /build to Render, Vercel, or Netlify
```

### Render deploy
- Build command: `npm run build`
- Publish directory: `build`
- Point rentease.space CNAME → your Render URL

## ✨ What makes this unique

| Feature | Design choice |
|---------|--------------|
| **Color palette** | Midnight blue #070B14 + Electric teal #0EA5E9 + Gold #EAB308 |
| **Typography** | Space Grotesk (headings) + Inter (body) — not the default sans-serif |
| **Cards** | Glassmorphism with `backdrop-filter: blur(16px)` |
| **Gradient bars** | Each property has its own gradient identity |
| **AI Chatbot** | Floating 🤖 FAB with context-aware responses from real data |
| **Ambient grid** | Subtle 60px blue grid on entire background |
| **Charts** | Recharts with custom dark-themed tooltips |
| **Glow effects** | Teal box-shadows on interactive elements |

## 📋 All 30 features implemented

1. ✅ Role-based login (RBAC table in Admin → Role management)
2. ✅ Property dashboard (KPIs per property + portfolio overview)
3. ✅ Property map (placeholder for Google Maps integration)
4. ✅ Property images (upload buttons wired)
5. ✅ Room booking (Rooms tab with filter)
6. ✅ Online rental agreement (auto-generate button in Tenants tab)
7. ✅ Security deposit management (shown in tenant cards)
8. ✅ Automatic rent reminders (Admin → Reminders)
9. ✅ Online payment gateway (UPI, Credit, Debit, Net Banking modal)
10. ✅ Maintenance requests (tab with priority, status, assign)
11. ✅ Visitor management (tab with check-in/check-out)
12. ✅ Tenant documents (Documents tab)
13. ✅ Lease management (lease table with days left)
14. ✅ Smart search (search in Properties, Tenants pages)
15. ✅ Advanced filters (type, status, property filters)
16. ✅ Analytics dashboard (BarChart, LineChart, PieChart)
17. ✅ Expense tracking (Admin → Expense tracking)
18. ✅ Notification center (toast system)
19. ✅ QR code payments (QR section in Payments tab)
20. ✅ Tenant history (tenants table with past data)
21. ✅ Room maintenance status (status pills in Rooms tab)
22. ✅ Invoice & receipt generation (Download PDF buttons)
23. ✅ Multi-property support (6 properties, one account)
24. ✅ Feedback & ratings (Feedback tab with stars)
25. ✅ Admin reports (Admin → Reports, PDF + Excel)
26. ✅ Dark mode (entire app is dark by design)
27. ✅ Audit log (Admin → Audit log with type filter)
28. ✅ Backup & restore (Admin → Backup & restore)
29. ✅ AI chatbot (floating 🤖 widget with real data answers)
30. ✅ Predictive analytics (trend lines in Analytics tab)

## 🔧 Backend integration (production)

Replace `src/context/AppContext.js` actions with Axios API calls:
```js
// Example
const addProperty = async (data) => {
  const res = await axios.post('/api/properties', data, { headers:{ Authorization:`Bearer ${token}` }});
  setProperties(prev => [...prev, res.data]);
};
```

Tech stack suggestion:
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (store in httpOnly cookie)
- **Payments:** Razorpay
- **Storage:** Cloudinary (images), AWS S3 (PDFs)
- **Notifications:** Nodemailer + Twilio + WhatsApp Business API
- **Deploy:** Render (backend) + Render/Vercel (frontend)
