// routes/dashboard.js  — portfolio-level stats
const router   = require('express').Router();
const { Property, Room, Tenant, Payment, Maintenance, Expense } = require('../models');
const { protect: P } = require('../middleware/auth');

router.get('/', P, async (req, res) => {
  try {
    const now   = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const [
      totalProps, totalRooms, occupied, vacant, maintenance,
      totalTenants, monthlyIncome, monthlyExpenses,
      pendingPayments, leaseExpiring, recentPayments,
      revByProp, roomsByStatus, income6, expenses6,
    ] = await Promise.all([
      Property.countDocuments({ isActive: true }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'Occupied' }),
      Room.countDocuments({ status: 'Vacant' }),
      Room.countDocuments({ status: 'Under Maintenance' }),
      Tenant.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $match: { status:'Paid', month, year } },
        { $group: { _id:null, total: { $sum:'$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { month, year } },
        { $group: { _id:null, total: { $sum:'$amount' } } },
      ]),
      Payment.countDocuments({ status: 'Pending' }),
      Tenant.countDocuments({ isActive:true, leaseEnd: { $lte: new Date(Date.now() + 30*86400000) } }),
      Payment.find({ status:'Paid' }).sort('-paidAt').limit(5)
        .populate('propertyId','name').populate('tenantId','name unit'),
      // Revenue by property this month
      Payment.aggregate([
        { $match: { status:'Paid', month, year } },
        { $group: { _id:'$propertyId', total:{ $sum:'$amount' }, name:{ $first:'$propertyName' } } },
        { $sort: { total:-1 } },
      ]),
      // Rooms by status chart
      Room.aggregate([
        { $group: { _id:'$status', count:{ $sum:1 } } },
      ]),
      // 6-month income trend
      Payment.aggregate([
        { $match: { status:'Paid', year } },
        { $group: { _id:'$month', total:{ $sum:'$amount' } } },
        { $sort: { _id:1 } },
      ]),
      // 6-month expense trend
      Expense.aggregate([
        { $match: { year } },
        { $group: { _id:'$month', total:{ $sum:'$amount' } } },
        { $sort: { _id:1 } },
      ]),
    ]);

    const incomeTotal   = monthlyIncome[0]?.total   || 0;
    const expenseTotal  = monthlyExpenses[0]?.total  || 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalProps, totalRooms, occupied, vacant,
          maintenance, totalTenants, leaseExpiring,
          monthlyIncome: incomeTotal,
          monthlyExpenses: expenseTotal,
          netProfit: incomeTotal - expenseTotal,
          pendingPayments,
          occupancyRate: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
        },
        recentPayments,
        revByProp,
        roomsByStatus,
        income6,
        expenses6,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
