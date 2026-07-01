// routes/tenants.js
const router = require('express').Router();
const { Tenant, Room, AuditLog, Notification } = require('../models');
const { protect: P } = require('../middleware/auth');

const log = async (req, action, detail, icon='👤') => {
  try { await AuditLog.create({ userId:req.user?._id, userName:req.user?.name, action, detail, icon }); } catch(_){}
};

// GET /api/tenants — list with filters
router.get('/', P, async (req, res) => {
  try {
    const q = {};
    if (req.query.propertyId) q.propertyId = req.query.propertyId;
    if (req.query.isActive !== undefined) q.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      const re = new RegExp(req.query.search, 'i');
      q.$or = [{ name: re }, { phone: re }, { unit: re }, { email: re }];
    }
    // Lease expiring soon
    if (req.query.expiringSoon === 'true') {
      q.leaseEnd = { $lte: new Date(Date.now() + 30*86400000) };
      q.isActive = true;
    }

    const tenants = await Tenant.find(q)
      .populate('propertyId','name city emoji gradient accentColor')
      .sort('-createdAt');
    res.json({ success: true, count: tenants.length, data: tenants });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/tenants/:id
router.get('/:id', P, async (req,res) => {
  try {
    const t = await Tenant.findById(req.params.id).populate('propertyId','name city');
    if (!t) return res.status(404).json({ success:false, message:'Tenant not found' });
    res.json({ success:true, data:t });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/tenants
router.post('/', P, async (req, res) => {
  try {
    const tenant = await Tenant.create(req.body);
    // Update room status to Occupied
    if (req.body.roomId) {
      await Room.findByIdAndUpdate(req.body.roomId, { status:'Occupied', tenant: req.body.name });
    }
    await log(req, 'Tenant added', `${tenant.name} → ${tenant.unit}`, '👤');
    await Notification.create({
      title: 'New Tenant Added',
      message: `${tenant.name} has been onboarded`,
      type: 'tenant',
    });
    res.status(201).json({ success: true, data: tenant });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/tenants/:id
router.put('/:id', P, async (req,res) => {
  try {
    const t = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!t) return res.status(404).json({ success:false, message:'Not found' });
    await log(req, 'Tenant updated', t.name, '✏️');
    res.json({ success:true, data:t });
  } catch(e){ res.status(400).json({ success:false, message:e.message }); }
});

// DELETE /api/tenants/:id  (vacate — soft delete)
router.delete('/:id', P, async(req,res) => {
  try {
    const t = await Tenant.findByIdAndUpdate(req.params.id, {
      isActive: false,
      vacatedAt: new Date(),
      reasonForLeaving: req.body?.reason || 'Not specified',
    }, { new:true });
    if (!t) return res.status(404).json({ success:false, message:'Not found' });
    // Free the room
    if (t.roomId) await Room.findByIdAndUpdate(t.roomId, { status:'Vacant', tenant:null });
    await log(req, 'Tenant vacated', `${t.name} left ${t.unit}`, '🚪');
    res.json({ success:true, message:'Tenant vacated', data:t });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/tenants/:id/feedback
router.post('/:id/feedback', P, async(req,res) => {
  try {
    const t = await Tenant.findById(req.params.id);
    if (!t) return res.status(404).json({ success:false, message:'Not found' });
    t.feedback.push(req.body);
    await t.save();
    res.json({ success:true, message:'Feedback recorded' });
  } catch(e){ res.status(400).json({ success:false, message:e.message }); }
});

// POST /api/tenants/:id/documents
router.post('/:id/documents', P, async(req,res) => {
  try {
    const t = await Tenant.findByIdAndUpdate(req.params.id,
      { $push: { documents: req.body } }, { new:true }
    );
    await log(req, 'Document uploaded', `${t.name} — ${req.body.type}`, '📄');
    res.json({ success:true, data:t });
  } catch(e){ res.status(400).json({ success:false, message:e.message }); }
});

module.exports = router;
