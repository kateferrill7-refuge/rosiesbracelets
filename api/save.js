// /api/save.js
// Runs on Vercel's server. Saves bracelet listings and photos to Vercel Blob
// storage. Only checks a password you choose (ADMIN_PASSWORD) - no GitHub
// token or repo permissions involved.

const { put, head } = require('@vercel/blob');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_PATH = 'data.json';

async function readData() {
  const info = await head(DATA_PATH).catch(() => null);
  if (!info) return [];
  const r = await fetch(info.url + '?t=' + Date.now());
  if (!r.ok) return [];
  return r.json();
}

async function writeData(bracelets) {
  await put(DATA_PATH, JSON.stringify(bracelets, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!ADMIN_PASSWORD) {
    res.status(500).json({ error: 'Server is missing the ADMIN_PASSWORD environment variable.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  const { password, action, bracelet, editingId, photoBase64, id } = body || {};

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  try {
    let bracelets = await readData();

    if (action === 'save') {
      let photoUrl = editingId
        ? (bracelets.find(b => b.id === editingId) || {}).photo || null
        : null;

      if (photoBase64) {
        const buffer = Buffer.from(photoBase64, 'base64');
        const blob = await put('images/' + Date.now() + '.jpg', buffer, {
          access: 'public',
          contentType: 'image/jpeg'
        });
        photoUrl = blob.url;
      } else if (photoBase64 === null) {
        photoUrl = null; // photo explicitly removed
      }

      if (editingId) {
        const idx = bracelets.findIndex(b => b.id === editingId);
        const updatedItem = { id: editingId, name: bracelet.name, price: bracelet.price, desc: bracelet.desc, photo: photoUrl };
        if (idx !== -1) bracelets[idx] = updatedItem; else bracelets.push(updatedItem);
      } else {
        bracelets.push({ id: Date.now(), name: bracelet.name, price: bracelet.price, desc: bracelet.desc, photo: photoUrl });
      }

      await writeData(bracelets);
      res.status(200).json({ ok: true, bracelets });
      return;
    }

    if (action === 'delete') {
      bracelets = bracelets.filter(b => b.id !== id);
      await writeData(bracelets);
      res.status(200).json({ ok: true, bracelets });
      return;
    }

    res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Something went wrong saving.' });
  }
};
