const router = require('express').Router();
const Entry = require('../models/Entry');
const { protect } = require('../middleware/auth');
const { NUM, STR, BOOL, DATE_RE } = require('../models/fields');
router.use(protect);

const clean = body => {
  const $set = {}, $unset = {};
  for (const k of [...NUM, ...STR, ...BOOL]) {
    if (!(k in body)) continue;
    const v = body[k];
    if (v === null || v === '') { $unset[k] = ''; continue; }
    if (NUM.includes(k)) { const n = Number(v); if (!Number.isFinite(n) || n < 0) continue; $set[k] = n; }
    else if (BOOL.includes(k)) { if (v === 0 || v === 1) $set[k] = v; }
    else if (k === 'readingType') { if (['subject', 'story'].includes(v)) $set[k] = v; }
    else $set[k] = String(v).slice(0, 300);
  }
  return { $set, $unset };
};

router.get('/', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) return res.status(400).json({ message: 'from and to must be YYYY-MM-DD' });
    res.json(await Entry.find({ user: req.user._id, date: { $gte: from, $lte: to } }).sort('date').lean());
  } catch (e) { next(e); }
});

router.get('/:date', async (req, res, next) => {
  try {
    if (!DATE_RE.test(req.params.date)) return res.status(400).json({ message: 'Invalid date' });
    res.json(await Entry.findOne({ user: req.user._id, date: req.params.date }).lean() || {});
  } catch (e) { next(e); }
});

router.put('/:date', async (req, res, next) => {
  try {
    if (!DATE_RE.test(req.params.date)) return res.status(400).json({ message: 'Invalid date' });
    const { $set, $unset } = clean(req.body || {});
    const update = { $setOnInsert: { user: req.user._id, date: req.params.date } };
    if (Object.keys($set).length) update.$set = $set;
    if (Object.keys($unset).length) update.$unset = $unset;
    res.json(await Entry.findOneAndUpdate({ user: req.user._id, date: req.params.date }, update, { upsert: true, new: true }).lean());
  } catch (e) { next(e); }
});

router.delete('/:date', async (req, res, next) => {
  try { await Entry.deleteOne({ user: req.user._id, date: req.params.date }); res.json({ deleted: true }); } catch (e) { next(e); }
});

router.delete('/', async (req, res, next) => {
  try { const r = await Entry.deleteMany({ user: req.user._id }); res.json({ deleted: r.deletedCount }); } catch (e) { next(e); }
});
module.exports = router;
