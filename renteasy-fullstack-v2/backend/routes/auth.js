// routes/auth.js
const router  = require('express').Router();
const { User } = require('../models');
const { protect, signToken } = require('../middleware/auth');

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user: user.toSafe() });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Only allow admin to create admin/manager accounts
    const safeRole = ['admin','manager'].includes(role) ? role : 'tenant';
    const user = await User.create({ name, email, password, phone, role: safeRole });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toSafe() });
});

// PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/users  (admin only — list all users)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, data: users.map(u=>u.toSafe()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
