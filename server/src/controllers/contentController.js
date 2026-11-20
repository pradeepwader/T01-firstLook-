const Content = require('../models/Content');
const asyncHandler = require('../utils/asyncHandler');
const defaults = require('../services/defaultContent');

const DEFAULTS = { home: defaults };

exports.get = asyncHandler(async (req, res) => {
  const key = req.params.key;
  if (!DEFAULTS[key]) return res.status(404).json({ success: false, message: 'Unknown content page' });
  const doc = await Content.findOne({ key });
  res.json({ success: true, data: { ...DEFAULTS[key], ...(doc?.data || {}) } });
});

exports.update = asyncHandler(async (req, res) => {
  const key = req.params.key;
  if (!DEFAULTS[key]) return res.status(404).json({ success: false, message: 'Unknown content page' });
  const data = req.body.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ success: false, message: 'Invalid content' });
  }
  // Only known top-level sections may be written
  const clean = Object.fromEntries(Object.entries(data).filter(([k]) => k in DEFAULTS[key]));
  const doc = await Content.findOneAndUpdate({ key }, { key, data: clean }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json({ success: true, data: { ...DEFAULTS[key], ...doc.data } });
});

exports.DEFAULTS = DEFAULTS;
