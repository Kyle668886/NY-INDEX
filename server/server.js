const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'ny_index_secret_2026';
const APP_DIR = path.join(__dirname, '..'); // NY_INDEX_App 根目录

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 同时托管前端（index.html / admin.html / css / js）
app.use(express.static(APP_DIR));

db.ensureDefaultAdmin();

/* ---------------- 上传配置 ---------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持图片文件'));
  }
});

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: '未登录或登录已过期' });
  }
}

function adminAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  try {
    const u = jwt.verify(token, JWT_SECRET);
    if (u.role !== 'admin') throw new Error('no role');
    req.admin = u;
    next();
  } catch (e) {
    res.status(401).json({ error: '无权限' });
  }
}

/* ---------------- 公开接口 ---------------- */
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 档口列表（供注册认领下拉，不含密码）
app.get('/api/stalls', (req, res) => {
  res.json(
    db.getAllStalls().map((s) => ({
      id: s.id,
      name: s.name,
      building: s.building,
      floor: s.floor,
      room: s.room,
      style: s.style,
      category: s.category,
      claimed: !!s.claimed
    }))
  );
});

// 某档口的已审核产品图（app 详情页展示）
app.get('/api/stalls/:name/products', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  res.json(
    db.getApprovedByStallName(name).map((p) => ({
      id: p.id,
      url: '/uploads/' + p.filename,
      caption: p.caption,
      uploadedAt: p.uploadedAt
    }))
  );
});

/* ---------------- 档口账号 ---------------- */
// 认领（首次注册）
app.post('/api/stall/register', (req, res) => {
  const { name, password } = req.body || {};
  if (!name || !password) return res.status(400).json({ error: '缺少档口名或密码' });
  if (String(password).length < 4) return res.status(400).json({ error: '密码至少 4 位' });
  const existing = db.getStallByName(name);
  if (!existing) return res.status(404).json({ error: '未找到该档口，请确认名称' });
  const claimed = db.claimStall(name, require('bcryptjs').hashSync(password, 10));
  if (!claimed) return res.status(409).json({ error: '该档口已被认领，请直接登录' });
  const token = jwt.sign({ stallId: claimed.id, name: claimed.name, role: 'stall' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, stall: db.stallPublic(claimed) });
});

// 登录
app.post('/api/stall/login', (req, res) => {
  const { name, password } = req.body || {};
  const s = db.verifyStallPassword(name, password);
  if (!s) return res.status(401).json({ error: '档口名或密码错误' });
  const token = jwt.sign({ stallId: s.id, name: s.name, role: 'stall' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, stall: db.stallPublic(s) });
});

// 我的档口 + 我的产品
app.get('/api/stall/me', auth, (req, res) => {
  const s = db.getStallById(req.user.stallId);
  if (!s) return res.status(404).json({ error: '档口不存在' });
  const products = db.getProductsByStall(s.id).map((p) => ({
    id: p.id,
    url: '/uploads/' + p.filename,
    caption: p.caption,
    status: p.status,
    uploadedAt: p.uploadedAt
  }));
  res.json({ stall: db.stallPublic(s), products });
});

// 上传产品图（进入待审核）
app.post('/api/stall/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到图片' });
  const caption = (req.body.caption || '').toString().slice(0, 200);
  const s = db.getStallById(req.user.stallId);
  const p = db.addProduct({ stallId: s.id, stallName: s.name, filename: req.file.filename, caption });
  res.json({ product: { id: p.id, url: '/uploads/' + p.filename, status: p.status } });
});

/* ---------------- 管理员 ---------------- */
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const a = db.getAdmin(username);
  if (!a || !require('bcryptjs').compareSync(password, a.passwordHash))
    return res.status(401).json({ error: '管理员账号或密码错误' });
  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

// 待审核队列
app.get('/api/admin/pending', adminAuth, (req, res) => {
  res.json(
    db.getPendingProducts().map((p) => ({
      id: p.id,
      stallName: p.stallName,
      url: '/uploads/' + p.filename,
      caption: p.caption,
      uploadedAt: p.uploadedAt
    }))
  );
});

// 审核：通过 / 拒绝
app.post('/api/admin/review', adminAuth, (req, res) => {
  const { id, decision, note } = req.body || {};
  if (!['approve', 'reject'].includes(decision))
    return res.status(400).json({ error: 'decision 必须为 approve 或 reject' });
  const p = db.reviewProduct(id, decision, note);
  if (!p) return res.status(404).json({ error: '产品不存在' });
  res.json({ ok: true, status: p.status });
});

/* ---------------- 错误处理 ---------------- */
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || '请求失败' });
});

app.listen(PORT, () => {
  console.log('南油档口后端已启动: http://localhost:' + PORT);
  console.log('前端访问:            http://localhost:' + PORT + '/');
  console.log('管理员审核页:        http://localhost:' + PORT + '/admin.html');
});
