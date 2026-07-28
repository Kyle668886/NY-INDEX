const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// 默认数据目录（本地开发）：server/data
// 线上部署可通过环境变量 DATA_DIR 指向持久盘挂载目录（如 /app/data），实现数据持久化
const DEFAULT_DATA_DIR = path.join(__dirname, 'data');
const DATA_DIR = process.env.DATA_DIR || DEFAULT_DATA_DIR;
const DATA_FILE = path.join(DATA_DIR, 'store.json');
// 仓库内提交的种子文件（含 234 个档口），首次运行且 DATA_DIR 下无 store.json 时复制为运行数据
const SEED_FILE = path.join(DEFAULT_DATA_DIR, 'seed.json');

// 默认管理员密码（仅在未设置 ADMIN_PASSWORD 且 admins 为空时使用，强烈建议部署时通过环境变量设置）
const DEFAULT_ADMIN_PASSWORD = '&qh%xqNbrS!f*HaR';

function initStorage() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seed = fs.existsSync(SEED_FILE)
      ? fs.readFileSync(SEED_FILE, 'utf-8')
      : JSON.stringify({ stalls: [], products: [], admins: [] }, null, 2);
    fs.writeFileSync(DATA_FILE, seed, 'utf-8');
  }
}

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    initStorage();
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
  initStorage();
  const data = load();
  if (data.admins.length === 0) {
    const pw = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    data.admins.push({
      username: 'admin',
      passwordHash: bcrypt.hashSync(pw, 10)
    });
    save(data);
    console.log('[seed] 默认管理员已创建 -> admin / ' + (process.env.ADMIN_PASSWORD ? '(来自环境变量 ADMIN_PASSWORD)' : DEFAULT_ADMIN_PASSWORD));
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
