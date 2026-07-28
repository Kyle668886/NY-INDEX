const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, 'data', 'store.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    return { stalls: [], products: [], admins: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/* ---------------- Stalls ---------------- */
function getAllStalls() {
  return load().stalls;
}

function getStallByName(name) {
  return load().stalls.find((s) => s.name === name) || null;
}

function getStallById(id) {
  return load().stalls.find((s) => s.id === id) || null;
}

function claimStall(name, passwordHash) {
  const data = load();
  const s = data.stalls.find((x) => x.name === name);
  if (!s) return null;
  if (s.claimed) return { error: 'already_claimed' };
  s.passwordHash = passwordHash;
  s.claimed = true;
  s.createdAt = new Date().toISOString();
  save(data);
  return s;
}

function verifyStallPassword(name, password) {
  const s = getStallByName(name);
  if (!s || !s.claimed) return null;
  if (!bcrypt.compareSync(password, s.passwordHash)) return null;
  return s;
}

/* ---------------- Products ---------------- */
function addProduct({ stallId, stallName, filename, caption }) {
  const data = load();
  const p = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    stallId,
    stallName,
    filename,
    caption: caption || '',
    status: 'pending', // pending | approved | rejected
    uploadedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: ''
  };
  data.products.push(p);
  save(data);
  return p;
}

function getProductsByStall(stallId) {
  return load().products.filter((p) => p.stallId === stallId);
}

function getPendingProducts() {
  return load().products.filter((p) => p.status === 'pending');
}

function getApprovedByStallName(stallName) {
  return load().products.filter(
    (p) => p.stallName === stallName && p.status === 'approved'
  );
}

function reviewProduct(id, decision, note) {
  const data = load();
  const p = data.products.find((x) => x.id === id);
  if (!p) return null;
  p.status = decision === 'approve' ? 'approved' : 'rejected';
  p.reviewedAt = new Date().toISOString();
  p.reviewNote = note || '';
  save(data);
  return p;
}

/* ---------------- Admins ---------------- */
function getAdmin(username) {
  return load().admins.find((a) => a.username === username) || null;
}

function ensureDefaultAdmin() {
  const data = load();
  if (data.admins.length === 0) {
    data.admins.push({
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin888', 10)
    });
    save(data);
    console.log('[seed] 默认管理员已创建 -> admin / admin888');
  }
}

function stallPublic(s) {
  return {
    id: s.id,
    name: s.name,
    building: s.building,
    floor: s.floor,
    room: s.room,
    style: s.style,
    category: s.category
  };
}

module.exports = {
  getAllStalls,
  getStallByName,
  getStallById,
  claimStall,
  verifyStallPassword,
  addProduct,
  getProductsByStall,
  getPendingProducts,
  getApprovedByStallName,
  reviewProduct,
  getAdmin,
  ensureDefaultAdmin,
  stallPublic
};
