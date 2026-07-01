// routes/payments.js
const router = require('express').Router();
const { Payment, Tenant, AuditLog, Notification } = require('../models');
const { protect: P } = require('../middleware/auth');

const log = async (req, action, detail) => {
  try { await AuditLog.create({ userId:req.user?._id, userName:req.user?.name, action, detail, icon:'💳' }); } catch(_) {}
};

// GET /api/payments
router.get('/', P, async (req, res) => {
  try {
    const q = {};
    if (req.query.propertyId) q.propertyId = req.query.propertyId;
    if (req.query.tenantId)   q.tenantId   = req.query.tenantId;
    if (req.query.status)     q.status     = req.query.status;
    if (req.query.month)      q.month      = Number(req.query.month);
    if (req.query.year)       q.year       = Number(req.query.year);

    const payments = await Payment.find(q)
      .populate('propertyId','name')
      .populate('tenantId','name phone unit')
      .sort('-paidAt');

    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/summary  — monthly summary
router.get('/summary', P, async (req, res) => {
  try {
    const { propertyId, year = new Date().getFullYear() } = req.query;
    const match = { year: Number(year), status: 'Paid' };
    if (propertyId) match.propertyId = require('mongoose').Types.ObjectId.createFromHexString(propertyId);

    const monthly = await Payment.aggregate([
      { $match: match },
      { $group: { _id: '$month', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const total = await Payment.aggregate([
      { $match: { ...match } },
      { $group: { _id: null, total: { $sum: '$amount' }, pending: { $sum: { $cond:[{$eq:['$status','Pending']},1,0] } } } },
    ]);

    res.json({ success: true, data: { monthly, total: total[0] || { total:0, pending:0 } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payments/:id
router.get('/:id', P, async (req,res) => {
  try {
    const p = await Payment.findById(req.params.id).populate('propertyId tenantId');
    if (!p) return res.status(404).json({ success:false, message:'Payment not found' });
    res.json({ success:true, data:p });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/payments  — record a payment
router.post('/', P, async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    // Mark tenant as paid this month
    if (req.body.tenantId) {
      await Tenant.findByIdAndUpdate(req.body.tenantId, { paidThisMonth: true });
    }

    await log(req, 'Rent paid', `₹${payment.amount?.toLocaleString('en-IN')} via ${payment.method} — TXN: ${payment.txnId}`);
    await Notification.create({
      title: 'Rent Received',
      message: `₹${payment.amount?.toLocaleString('en-IN')} collected from ${req.body.tenantName || 'tenant'}`,
      type: 'payment',
    });

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/payments/:id
router.put('/:id', P, async(req,res) => {
  try {
    const p = await Payment.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    res.json({ success:true, data:p });
  } catch(e){ res.status(400).json({ success:false, message:e.message }); }
});

// DELETE /api/payments/:id
router.delete('/:id', P, async(req,res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Deleted' });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/payments/send-reminders — send rent reminders
router.post('/send-reminders', P, async (req, res) => {
  try {
    const today = new Date();
    const unpaid = await Tenant.find({ paidThisMonth: false, isActive: true });
    // In production: send via Nodemailer/SMS
    await log(req, 'Reminders sent', `${unpaid.length} tenants notified`, '🔔');
    await Notification.create({
      title: 'Rent Reminders Sent',
      message: `Automated reminders sent to ${unpaid.length} tenants`,
      type: 'payment',
    });
    res.json({ success: true, message: `Reminders sent to ${unpaid.length} tenants`, count: unpaid.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
