// /api/data.js
// Public read endpoint - returns the current bracelet listings from
// Vercel Blob storage. No password needed, this just powers the storefront.

const { head } = require('@vercel/blob');

module.exports = async (req, res) => {
  try {
    const info = await head('data.json').catch(() => null);
    if (!info) { res.status(200).json([]); return; }
    const r = await fetch(info.url + '?t=' + Date.now());
    if (!r.ok) { res.status(200).json([]); return; }
    const json = await r.json();
    res.status(200).json(json);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Could not load shop data.' });
  }
};
