// routes/expenses.js
const router = require('express').Router();
const { Expense, AuditLog } = require('../models');
const { protect: P } = require('../middleware/auth');
const log = async (req, action, detail) => { try { await AuditLog.create({ userId:req.user?._id, userName:req.user?.name, action, detail, icon:'💸' }); } catch(_){} };

router.get('/', P, async(req,res) => {
  try {
    const q = {};
    if (req.query.propertyId) q.propertyId = req.query.propertyId;
    if (req.query.category)   q.category   = req.query.category;
    if (req.query.month)      q.month      = Number(req.query.month);
    if (req.query.year)       q.year       = Number(req.query.year);
    const expenses = await Expense.find(q).populate('propertyId','name').sort('-date');
    res.json({ success:true, count:expenses.length, data:expenses });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.post('/', P, async(req,res) => {
  try {
    const e = await Expense.create(req.body);
    await log(req, 'Expense recorded', `₹${e.amount?.toLocaleString('en-IN')} — ${e.category}`);
    res.status(201).json({ success:true, data:e });
  } catch(err){ res.status(400).json({ success:false, message:err.message }); }
});

router.put('/:id', P, async(req,res) => {
  try { const e=await Expense.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); res.json({success:true,data:e}); }
  catch(err){ res.status(400).json({ success:false, message:err.message }); }
});

router.delete('/:id', P, async(req,res) => {
  try { await Expense.findByIdAndDelete(req.params.id); res.json({success:true,message:'Deleted'}); }
  catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

// GET /api/expenses/totals?propertyId=&year=
router.get('/totals', P, async(req,res) => {
  try {
    const match = {};
    if (req.query.propertyId) match.propertyId = require('mongoose').Types.ObjectId.createFromHexString(req.query.propertyId);
    if (req.query.year) match.year = Number(req.query.year);
    const byCategory = await Expense.aggregate([
      { $match: match },
      { $group: { _id:'$category', total:{ $sum:'$amount' } } },
      { $sort: { total:-1 } },
    ]);
    const totalAmount = byCategory.reduce((s,i) => s+i.total, 0);
    res.json({ success:true, data:{ byCategory, totalAmount } });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
