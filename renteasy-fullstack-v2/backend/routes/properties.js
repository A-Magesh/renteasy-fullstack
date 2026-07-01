// routes/properties.js
const router   = require('express').Router();
const { Property, Room, Tenant, Payment, Expense } = require('../models');
const { protect, adminOrManager, AuditLog } = require('../middleware/auth');
const { protect: P } = require('../middleware/auth');

const log = async (req, action, detail, icon = '🏢') => {
  try {
    const { AuditLog } = require('../models');
    await AuditLog.create({ userId: req.user?._id, userName: req.user?.name, action, detail, icon });
  } catch(_) {}
};

// GET /api/properties  — list all
router.get('/', P, async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true }).sort('name');

    // Attach live stats for each property
    const enriched = await Promise.all(properties.map(async (prop) => {
      const [totalRooms, occupied, vacant, maintenance, tenants, income, expenses, pendingPay] = await Promise.all([
        Room.countDocuments({ propertyId: prop._id }),
        Room.countDocuments({ propertyId: prop._id, status: 'Occupied' }),
        Room.countDocuments({ propertyId: prop._id, status: 'Vacant' }),
        Room.countDocuments({ propertyId: prop._id, status: 'Under Maintenance' }),
        Tenant.countDocuments({ propertyId: prop._id, isActive: true }),
        Payment.aggregate([
          { $match: { propertyId: prop._id, status:'Paid', month: new Date().getMonth()+1, year: new Date().getFullYear() } },
          { $group: { _id:null, total: { $sum:'$amount' } } },
        ]),
        Expense.aggregate([
          { $match: { propertyId: prop._id, month: new Date().getMonth()+1, year: new Date().getFullYear() } },
          { $group: { _id:null, total: { $sum:'$amount' } } },
        ]),
        Payment.countDocuments({ propertyId: prop._id, status:'Pending' }),
      ]);
      return {
        ...prop.toObject(),
        totalRooms, occupied, vacant, maintenance_count: maintenance,
        totalTenants: tenants,
        monthlyIncome: income[0]?.total || 0,
        monthlyExpenses: expenses[0]?.total || 0,
        pendingDues: pendingPay,
      };
    }));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/:id
router.get('/:id', P, async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop || !prop.isActive) return res.status(404).json({ success:false, message:'Property not found' });

    const [rooms, tenants, payments, maintenance, expenses, visitors, income, expenses2] = await Promise.all([
      Room.find({ propertyId: prop._id }).sort('unit'),
      Tenant.find({ propertyId: prop._id, isActive: true }),
      Payment.find({ propertyId: prop._id }).sort('-paidAt').limit(50),
      require('../models').Maintenance.find({ propertyId: prop._id }).sort('-createdAt'),
      Expense.find({ propertyId: prop._id }).sort('-date'),
      require('../models').Visitor.find({ propertyId: prop._id }).sort('-checkIn').limit(30),
      Payment.aggregate([
        { $match: { propertyId: prop._id, status:'Paid' } },
        { $group: { _id:{ month:'$month', year:'$year' }, total: { $sum:'$amount' } } },
        { $sort: { '_id.year':1, '_id.month':1 } },
        { $limit: 6 },
      ]),
      Expense.aggregate([
        { $match: { propertyId: prop._id } },
        { $group: { _id:null, total: { $sum:'$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        ...prop.toObject(),
        rooms, tenants, payments, maintenance, expenses, visitors,
        monthlyRevenue: income,
        totalExpenses: expenses2[0]?.total || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/properties
router.post('/', P, async (req, res) => {
  try {
    const prop = await Property.create(req.body);
    await log(req, 'Property created', `${prop.name} in ${prop.city}`, '🏢');
    res.status(201).json({ success: true, data: prop });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/properties/:id
router.put('/:id', P, async (req, res) => {
  try {
    const prop = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!prop) return res.status(404).json({ success:false, message:'Property not found' });
    await log(req, 'Property updated', prop.name, '✏️');
    res.json({ success: true, data: prop });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/properties/:id  (soft delete)
router.delete('/:id', P, async (req, res) => {
  try {
    const prop = await Property.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!prop) return res.status(404).json({ success:false, message:'Property not found' });
    await log(req, 'Property deactivated', prop.name, '🗑️');
    res.json({ success: true, message: 'Property deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/:id/stats  — full analytics
router.get('/:id/stats', P, async (req, res) => {
  try {
    const { id } = req.params;
    const pid = require('mongoose').Types.ObjectId.createFromHexString(id);

    const [roomStats, revenue6, expenses6, pendingPay, leaseExpiring] = await Promise.all([
      Room.aggregate([
        { $match: { propertyId: pid } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { propertyId: pid, status:'Paid' } },
        { $group: { _id: { month:'$month', year:'$year' }, total:{ $sum:'$amount' } } },
        { $sort: { '_id.year':1, '_id.month':1 } }, { $limit: 6 },
      ]),
      Expense.aggregate([
        { $match: { propertyId: pid } },
        { $group: { _id: '$category', total:{ $sum:'$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Payment.countDocuments({ propertyId: pid, status:'Pending' }),
      Tenant.find({ propertyId: pid, isActive:true, leaseEnd: { $lte: new Date(Date.now() + 30*86400000) } }),
    ]);

    res.json({ success: true, data: { roomStats, revenue6, expenses6, pendingPay, leaseExpiring } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
