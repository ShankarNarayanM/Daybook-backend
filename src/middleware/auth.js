const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not authenticated' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = user; next();
  } catch { res.status(401).json({ message: 'Session expired. Please sign in again.' }); }
};
exports.requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Forbidden' });
