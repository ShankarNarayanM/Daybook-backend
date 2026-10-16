const router = require('express').Router();
const Entry = require('../models/Entry');
const { protect } = require('../middleware/auth');
const { NUM, BOOL, DATE_RE } = require('../models/fields');
router.use(protect);

// GET /api/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) return res.status(400).json({ message: 'from and to must be YYYY-MM-DD' });
    const entries = await Entry.find({ user: req.user._id, date: { $gte: from, $lte: to } }).sort('date').lean();

    const numeric = {};
    for (const f of NUM) {
      const vals = entries.map(e => e[f]).filter(v => typeof v === 'number');
      if (!vals.length) continue;
      const total = vals.reduce((a, b) => a + b, 0);
      numeric[f] = { total: +total.toFixed(2), avg: +(total / vals.length).toFixed(2), max: Math.max(...vals), days: vals.length };
    }
    const flags = {};
    for (const f of BOOL) {
      const logged = entries.filter(e => e[f] === 0 || e[f] === 1);
      if (logged.length) flags[f] = { yes: logged.filter(e => e[f] === 1).length, logged: logged.length };
    }
    const series = entries.map(e => ({ date: e.date, ...Object.fromEntries(NUM.filter(f => typeof e[f] === 'number').map(f => [f, e[f]])) }));
    const learned = entries.filter(e => e.learningWhat?.trim()).map(e => ({ date: e.date, text: e.learningWhat }));
    const reading = { subject: 0, story: 0 };
    entries.forEach(e => { if (e.readingType && e.readingMins) reading[e.readingType] += e.readingMins; });

    res.json({ from, to, daysLogged: entries.length, numeric, flags, series, learned, reading });
  } catch (e) { next(e); }
});
module.exports = router;
