// server.js — RentEasy Backend Entry Point
require('dotenv').config();
const express     = require('express');
const mongoose    = require('mongoose');
const cors        = require('cors');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://rentease.space',
    'https://www.rentease.space',
    /\.onrender\.com$/,
  ],
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Rate limiting ──────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: 'Too many requests, please try again later.',
  skip: (req) => process.env.NODE_ENV === 'development',
});
app.use('/api/', limiter);

// ── Body parsers ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── MongoDB Connection ─────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

// ── Routes ─────────────────────────────────────────────────────────
const authRouter        = require('./routes/auth');
const propertiesRouter  = require('./routes/properties');
const roomsRouter       = require('./routes/rooms');
const tenantsRouter     = require('./routes/tenants');
const paymentsRouter    = require('./routes/payments');
const maintenanceRouter = require('./routes/maintenance');
const visitorsRouter    = require('./routes/visitors');
const expensesRouter    = require('./routes/expenses');
const auditRouter       = require('./routes/audit');
const dashboardRouter   = require('./routes/dashboard');
const reportsRouter     = require('./routes/reports');

app.use('/api/auth',        authRouter);
app.use('/api/properties',  propertiesRouter);
app.use('/api/rooms',       roomsRouter);
app.use('/api/tenants',     tenantsRouter);
app.use('/api/payments',    paymentsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/visitors',    visitorsRouter);
app.use('/api/expenses',    expensesRouter);
app.use('/api/audit',       auditRouter);
app.use('/api/dashboard',   dashboardRouter);
app.use('/api/reports',     reportsRouter);

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'RentEasy API running ✅',
    version: '2.0.0',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── Notifications GET ──────────────────────────────────────────────
const { Notification } = require('./models');
const { protect } = require('./middleware/auth');
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifs = await Notification.find().sort('-createdAt').limit(20);
    res.json({ success:true, data:notifs });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});
app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead:true });
    res.json({ success:true });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// ── Global error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     RentEasy API v2.0 — RUNNING       ║
║     http://localhost:${PORT}           ║
║     MongoDB: CONNECTED                ║
╚═══════════════════════════════════════╝
    `);
  });
};

start();

module.exports = app;
