// middleware/auth.js
const jwt  = require('jsonwebtoken');
const { User } = require('../models');

// ── Protect: verify JWT ────────────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Not authorised — no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or deactivated' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// ── Authorize: restrict to roles ──────────────────────────────────
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' cannot access this route` });
  }
  next();
};

// Shorthand helpers
exports.adminOnly       = [exports.protect, exports.authorize('admin')];
exports.adminOrManager  = [exports.protect, exports.authorize('admin','manager')];

// ── Generate JWT token ─────────────────────────────────────────────
exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// ── Audit logger middleware ─────────────────────────────────────────
const { AuditLog } = require('../models');
exports.audit = (action, icon = '📋', getDetail = () => '') => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400) {
      try {
        await AuditLog.create({
          userId:   req.user?._id,
          userName: req.user?.name || 'System',
          action, icon,
          detail:   getDetail(req),
          ip:       req.ip,
        });
      } catch (_) {}
    }
  });
  next();
};
