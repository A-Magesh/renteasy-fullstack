// routes/audit.js
const router = require('express').Router();
const { AuditLog } = require('../models');
const { protect: P } = require('../middleware/auth');

router.get('/', P, async(req,res) => {
  try {
    const q = {};
    if (req.query.action) q.action = new RegExp(req.query.action,'i');
    const limit = Number(req.query.limit) || 50;
    const logs = await AuditLog.find(q).sort('-createdAt').limit(limit);
    res.json({ success:true, count:logs.length, data:logs });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
