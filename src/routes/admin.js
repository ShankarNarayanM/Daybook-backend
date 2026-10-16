const router = require('express').Router();
const User = require('../models/User');
const Entry = require('../models/Entry');
const { protect, requireRole } = require('../middleware/auth');
router.use(protect, requireRole('admin'));

router.get('/users', async (req, res, next) => {
  try {
    const counts = Object.fromEntries((await Entry.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }])).map(c => [String(c._id), c.n]));
    const users = await User.find().sort('-createdAt').lean();
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, entries: counts[String(u._id)] || 0, createdAt: u.createdAt })));
  } catch (e) { next(e); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    await Entry.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (e) { next(e); }
});
module.exports = router;
