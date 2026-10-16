const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });
const emailOk = e => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || !name.trim() || !emailOk(email) || typeof password !== 'string' || password.length < 8)
      return res.status(400).json({ message: 'Enter a name, a valid email and a password of 8+ characters.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'That email is already registered.' });
    const role = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    const user = await User.create({ name, email, role, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(String(password || ''), user.password)))
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: sign(user), user: pub(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: pub(req.user) }));
module.exports = router;
