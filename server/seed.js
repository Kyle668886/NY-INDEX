// 若 data/store.json 不存在则初始化（实际种子数据由 Python 从 Excel 生成）
const fs = require('fs');
const path = require('path');
const db = require('./db');

const FILE = path.join(__dirname, 'data', 'store.json');
if (!fs.existsSync(FILE)) {
  const bcrypt = require('bcryptjs');
  const data = {
    stalls: [],
    products: [],
    admins: [{ username: 'admin', passwordHash: bcrypt.hashSync('admin888', 10) }]
  };
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log('已初始化空 store.json（请用 Python 从 Excel 导入档口种子）');
} else {
  console.log('store.json 已存在，' + db.getAllStalls().length + ' 个档口。');
}
