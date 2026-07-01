// routes/reports.js
const router   = require('express').Router();
const { Payment, Tenant, Room, Expense, Property } = require('../models');
const { protect: P } = require('../middleware/auth');

// GET /api/reports/overview
router.get('/overview', P, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const y = Number(year);

    const [annualIncome, annualExpenses, tenantStats, occupancyByProp] = await Promise.all([
      Payment.aggregate([
        { $match: { status:'Paid', year: y } },
        { $group: { _id:'$month', income:{ $sum:'$amount' }, count:{ $sum:1 } } },
        { $sort: { _id:1 } },
      ]),
      Expense.aggregate([
        { $match: { year: y } },
        { $group: { _id:'$month', expenses:{ $sum:'$amount' } } },
        { $sort: { _id:1 } },
      ]),
      Tenant.aggregate([
        { $group: { _id:'$isActive', count:{ $sum:1 } } },
      ]),
      Room.aggregate([
        { $lookup: { from:'properties', localField:'propertyId', foreignField:'_id', as:'prop' } },
        { $unwind: '$prop' },
        { $group: { _id:{ prop:'$prop.name', status:'$status' }, count:{ $sum:1 } } },
      ]),
    ]);

    res.json({ success:true, data:{ annualIncome, annualExpenses, tenantStats, occupancyByProp, year: y } });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/reports/monthly-revenue
router.get('/monthly-revenue', P, async (req, res) => {
  try {
    const { month = new Date().getMonth()+1, year = new Date().getFullYear() } = req.query;
    const data = await Payment.aggregate([
      { $match: { month:Number(month), year:Number(year) } },
      { $group: {
        _id: '$status',
        total:{ $sum:'$amount' },
        count:{ $sum:1 },
        txns: { $push: { tenantName:'$tenantName', amount:'$amount', method:'$method', txnId:'$txnId' } },
      }},
    ]);
    res.json({ success:true, data, month:Number(month), year:Number(year) });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/reports/revenue-by-property
router.get('/revenue-by-property', P, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const data = await Payment.aggregate([
      { $match: { status:'Paid', year:Number(year) } },
      { $group: { _id:'$propertyId', total:{ $sum:'$amount' }, name:{ $first:'$propertyName' }, txns:{ $sum:1 } } },
      { $sort: { total:-1 } },
    ]);
    res.json({ success:true, data });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/reports/pending-dues
router.get('/pending-dues', P, async (req, res) => {
  try {
    const unpaid = await Tenant.find({ paidThisMonth:false, isActive:true })
      .populate('propertyId','name');
    const total  = unpaid.reduce((s,t) => s+t.rent, 0);
    res.json({ success:true, count:unpaid.length, totalDue:total, data:unpaid });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/reports/expense-summary
router.get('/expense-summary', P, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const data = await Expense.aggregate([
      { $match: { year:Number(year) } },
      { $group: { _id:'$category', total:{ $sum:'$amount' }, count:{ $sum:1 } } },
      { $sort: { total:-1 } },
    ]);
    res.json({ success:true, data });
  } catch (err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

module.exports = router;
