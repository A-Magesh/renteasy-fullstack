// routes/visitors.js
const router = require('express').Router();
const { Visitor, AuditLog } = require('../models');
const { protect: P } = require('../middleware/auth');
const log = async (req, action, detail) => { try { await AuditLog.create({ userId:req.user?._id, userName:req.user?.name, action, detail, icon:'👥' }); } catch(_){} };

router.get('/', P, async(req,res) => {
  try { const q={}; if(req.query.propertyId) q.propertyId=req.query.propertyId; if(req.query.status) q.status=req.query.status; const v=await Visitor.find(q).populate('propertyId','name').sort('-checkIn'); res.json({success:true,count:v.length,data:v}); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
});
router.post('/', P, async(req,res) => {
  try { const v=await Visitor.create(req.body); await log(req,'Visitor registered',`${v.visitorName} → ${v.unit}`); res.status(201).json({success:true,data:v}); }
  catch(e){ res.status(400).json({success:false,message:e.message}); }
});
router.put('/:id/checkout', P, async(req,res) => {
  try { const v=await Visitor.findByIdAndUpdate(req.params.id,{checkOut:new Date(),status:'Checked Out'},{new:true}); if(!v) return res.status(404).json({success:false,message:'Not found'}); await log(req,'Visitor checked out',v.visitorName); res.json({success:true,data:v}); }
  catch(e){ res.status(500).json({success:false,message:e.message}); }
});
router.delete('/:id', P, async(req,res) => { try { await Visitor.findByIdAndDelete(req.params.id); res.json({success:true,message:'Deleted'}); } catch(e){ res.status(500).json({success:false,message:e.message}); } });
module.exports = router;
