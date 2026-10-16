require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { MONGO_URI, JWT_SECRET, PORT = 5000, CLIENT_ORIGIN = '' } = process.env;
if (!MONGO_URI || !JWT_SECRET) { console.error('Missing MONGO_URI or JWT_SECRET in .env'); process.exit(1); }

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN.split(',').map(s => s.trim()).filter(Boolean) }));
app.use(express.json({ limit: '50kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true }));

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entries'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Server error' }); });

mongoose.connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch(e => { console.error('Mongo connection failed:', e.message); process.exit(1); });


app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});