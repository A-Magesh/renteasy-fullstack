// routes/maintenance.js
const router = require('express').Router();
const { Maintenance, AuditLog, Notification } = require('../models');
const { protect: P } = require('../middleware/auth');

const log = async (req, action, detail) => {
  try { await AuditLog.create({ userId:req.user?._id, userName:req.user?.name, action, detail, icon:'🔧' }); } catch(_){}
};

router.get('/', P, async (req,res) => {
  try {
    const q = {};
    if (req.query.propertyId) q.propertyId = req.query.propertyId;
    if (req.query.status)     q.status     = req.query.status;
    if (req.query.category)   q.category   = req.query.category;
    const m = await Maintenance.find(q).populate('propertyId','name').sort('-createdAt');
    res.json({ success:true, count:m.length, data:m });
  } catch(e){ res.status(500).json({ success:false, message:e.message }); }
});

router.get('/:id', P, async(req,res) => {
  try { const m=await Maintenance.findById(req.params.id).populate('propertyId tenantId'); if(!m) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,data:m}); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
});

router.post('/', P, async(req,res) => {
  try {
    const m = await Maintenance.create(req.body);
    await log(req, 'Maintenance raised', `${m.category}: ${m.issue}`);
    await Notification.create({ title:'New Maintenance Request', message:`${m.category}: ${m.issue} (${m.priority} priority)`, type:'maintenance' });
    res.status(201).json({ success:true, data:m });
  } catch(e){ res.status(400).json({success:false,message:e.message}); }
});

router.put('/:id', P, async(req,res) => {
  try {
    if (req.body.status === 'Completed') req.body.resolvedAt = new Date();
    const m = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {new:true,runValidators:true});
    if (!m) return res.status(404).json({success:false,message:'Not found'});
    await log(req, 'Maintenance updated', `${m.issue} → ${m.status}`);
    if (m.status === 'Completed') {
      await Notification.create({ title:'Maintenance Completed', message:m.issue, type:'maintenance' });
    }
    res.json({success:true,data:m});
  } catch(e){ res.status(400).json({success:false,message:e.message}); }
});

router.delete('/:id', P, async(req,res) => {
  try { await Maintenance.findByIdAndDelete(req.params.id); res.json({success:true,message:'Deleted'}); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
});

module.exports = router;
