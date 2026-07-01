// routes/rooms.js
const router = require('express').Router();
const { Room, AuditLog } = require('../models');
const { protect: P } = require('../middleware/auth');

const log = async (req, action, detail) => {
  try { await AuditLog.create({ userId:req.user?._id, userName:req.user?.name, action, detail, icon:'🚪' }); } catch(_){}
};

router.get('/',      P, async (req, res) => {
  try {
    const q = {};
    if (req.query.propertyId) q.propertyId = req.query.propertyId;
    if (req.query.status)     q.status     = req.query.status;
    if (req.query.type)       q.type       = req.query.type;
    if (req.query.floor)      q.floor      = Number(req.query.floor);
    const rooms = await Room.find(q).populate('propertyId','name').sort('unit');
    res.json({ success:true, count:rooms.length, data:rooms });
  } catch(err){ res.status(500).json({ success:false, message:err.message }); }
});

router.get('/:id',  P, async (req,res)=>{
  try { const r=await Room.findById(req.params.id).populate('propertyId','name'); if(!r) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,data:r}); } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.post('/',    P, async (req,res)=>{
  try { const room=await Room.create(req.body); await log(req,'Room added',`Unit ${room.unit}`); res.status(201).json({success:true,data:room}); } catch(e){res.status(400).json({success:false,message:e.message});}
});

router.put('/:id',  P, async (req,res)=>{
  try { const r=await Room.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!r) return res.status(404).json({success:false,message:'Not found'}); await log(req,'Room updated',`Unit ${r.unit} → ${r.status}`); res.json({success:true,data:r}); } catch(e){res.status(400).json({success:false,message:e.message});}
});

router.delete('/:id', P, async(req,res)=>{
  try { await Room.findByIdAndDelete(req.params.id); await log(req,'Room deleted',''); res.json({success:true,message:'Deleted'}); } catch(e){res.status(500).json({success:false,message:e.message});}
});

module.exports = router;
