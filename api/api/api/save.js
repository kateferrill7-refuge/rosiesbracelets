// /api/save.js
// Runs on Vercel's server, never in the browser. Holds the real GitHub token
// and admin password as environment variables, so neither is ever exposed
// to site visitors or stored in the page itself.

const GH_OWNER  = process.env.GH_OWNER  || 'kateferrill7-refuge';
const GH_REPO   = process.env.GH_REPO   || 'rosiesbracelets';
const GH_BRANCH = process.env.GH_BRANCH || 'main';
const GH_TOKEN  = process.env.GH_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DATA_PATH = 'data.json';

function ghHeaders() {
  return { 'Authorization': 'token ' + GH_TOKEN, 'Accept': 'application/vnd.github+json' };
}
function ghContentsUrl(path) {
  return 'https://api.github.com/repos/' + GH_OWNER + '/' + GH_REPO + '/contents/' + path;
}
async function ghGetFile(path) {
  const res = await fetch(ghContentsUrl(path) + '?ref=' + GH_BRANCH, { headers: ghHeaders() });
  if (res.status === 404) return { sha: null, json: [] };
  if (!res.ok) throw new Error('GitHub error reading ' + path + ': ' + res.status);
  const j = await res.json();
  const content = Buffer.from(j.content, 'base64').toString('utf8');
  return { sha: j.sha, json: JSON.parse(content) };
}
async function ghPutFile(path, base64Content, message, sha) {
  const body = { message, content: base64Content, branch: GH_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(ghContentsUrl(path), {
    method: 'PUT',
    headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders()),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || ('GitHub save failed: ' + res.status));
  }
  return res.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!GH_TOKEN || !ADMIN_PASSWORD) {
    res.status(500).json({ error: 'Server is missing GH_TOKEN or ADMIN_PASSWORD environment variables.' });
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
    const { sha: dataSha, json: current } = await ghGetFile(DATA_PATH);
    let bracelets = Array.isArray(current) ? current : [];

    if (action === 'save') {
      let photoPath = editingId
        ? (bracelets.find(b => b.id === editingId) || {}).photo || null
        : null;

      if (photoBase64) {
        photoPath = 'images/' + Date.now() + '.jpg';
        await ghPutFile(photoPath, photoBase64, 'Add photo: ' + bracelet.name, null);
      } else if (photoBase64 === null) {
        photoPath = null; // photo explicitly removed
      }

      if (editingId) {
        const idx = bracelets.findIndex(b => b.id === editingId);
        const updatedItem = { id: editingId, name: bracelet.name, price: bracelet.price, desc: bracelet.desc, photo: photoPath };
        if (idx !== -1) bracelets[idx] = updatedItem; else bracelets.push(updatedItem);
      } else {
        bracelets.push({ id: Date.now(), name: bracelet.name, price: bracelet.price, desc: bracelet.desc, photo: photoPath });
      }

      const newContent = Buffer.from(JSON.stringify(bracelets, null, 2), 'utf8').toString('base64');
      await ghPutFile(DATA_PATH, newContent, (editingId ? 'Update' : 'Add') + ' bracelet: ' + bracelet.name, dataSha);
      res.status(200).json({ ok: true, bracelets });
      return;
    }

    if (action === 'delete') {
      const target = bracelets.find(b => b.id === id);
      bracelets = bracelets.filter(b => b.id !== id);
      const newContent = Buffer.from(JSON.stringify(bracelets, null, 2), 'utf8').toString('base64');
      await ghPutFile(DATA_PATH, newContent, 'Remove sold bracelet: ' + (target ? target.name : id), dataSha);
      res.status(200).json({ ok: true, bracelets });
      return;
    }

    res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Something went wrong saving to GitHub.' });
  }
};
