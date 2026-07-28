# 南油趋势指数 · Zeabur 部署指南（推荐）

> **为什么用 Zeabur**：本项目用户（深圳南油档口）都在国内，需要手机稳定打开。
> Zeabur 服务器在亚洲、中文界面、国内直连可访问；直接读取仓库里的 `Dockerfile` 构建，无需改代码。Render / Railway 等海外平台国内打不开，仅适合自测。

---

## 前置条件（已完成）

- 代码已推送到 `https://github.com/Kyle668886/NY-INDEX.git`（main 分支）
- 仓库根目录有 `Dockerfile`（已验证可直接构建）

---

## 第一步：登录 Zeabur

打开 https://zeabur.com → 点右上角 **登录/注册** → 选 **GitHub** 登录（用拥有 `Kyle668886/NY-INDEX` 的那个 GitHub 账号授权）。

> 无需 VPN，国内直连即可。

---

## 第二步：新建项目并部署

1. 登录后点左侧 **项目 → 新建项目**，给项目起名（如 `ny-index`）。
2. 进入项目后，点 **部署服务** → 选 **从 GitHub 部署**。
3. 在仓库列表里选 **`Kyle668886/NY-INDEX`**，分支选 `main`。
4. Zeabur 会自动检测到 `Dockerfile`，构建方式选 **Docker**（一般已自动选好）。
5. 点 **部署**，进入构建（约 2–4 分钟，可看日志）。

构建成功后会显示一个默认域名，类似 `ny-index.zeabur.app`。

---

## 第三步：设置环境变量（必做）

在 Service 页面点 **环境变量** 标签，添加以下三项（本项目 `db.js` / `server.js` 已支持）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATA_DIR` | `/app/data` | 数据/图片统一落在此目录 |
| `JWT_SECRET` | 一段强随机串（如 `openssl rand -hex 32` 生成） | 登录令牌签名密钥，**不要留默认值** |
| `ADMIN_PASSWORD` | 你自己设的管理员密码 | 后台 `admin.html` 登录密码 |

> 添加后 Zeabur 会自动重启服务使变量生效。

---

## 第四步：绑定域名（可选但建议）

- 默认已有一个 `*.zeabur.app` 子域名，直接可用。
- 想用自己域名：Service 页 **设置 → 域名 → 添加自定义域名**，按提示在域名解析处加 CNAME 记录即可（需域名已备案才能在国内正常使用）。

---

## 第五步：验收整个流程

1. 浏览器打开 `https://你的域名/`（结尾加 `/`）。
2. 打开 `https://你的域名/admin.html` → 用 `admin` + 你设的 `ADMIN_PASSWORD` 登录。
3. 手机打开同一地址 → **我 → 档口中心** → 认领一个档口（如 `PIETAS`）→ 上传产品图。
4. 回 `admin.html` 点 **通过** → 回 app 该档口详情页，应能看到这张图。

**本地已做过的端到端联调（注册→上传→审核→公开展示）全部通过**，云端按上面步骤即可复现。

---

## ⚠️ 免费版重要限制（务必知道）

- **文件系统是临时的**：免费版（及未挂载 Volume 时）每次重新部署都会清空档口上传的图片、审核记录、管理员账号（仅档口名单 `seed.json` 因烧录在镜像里会保留）。
- **解决持久化的两条路**：
  1. 升级 Zeabur 付费版并挂载 **Volume** 到 `/app/data`（`DATA_DIR` 已就绪，挂盘即生效，无需改代码）；
  2. 或把图片存储从本地磁盘换成**腾讯云 COS / 阿里云 OSS**（国内快、不丢、便宜），长期更推荐这条。

---

## 本地运行（开发 / 自测）

```bash
cd ~/Desktop/南油趋势指数/NY_INDEX_App/server
npm install
node server.js                 # 默认 http://localhost:4000
```

---

## 目录说明

| 路径 | 作用 |
|------|------|
| `index.html` / `app.js` / `styles.css` | 前端主应用 |
| `admin.html` | 管理员审核台 |
| `server/server.js` | Express 后端 + API + 托管前端 |
| `server/db.js` | JSON 文件存储层（支持 `DATA_DIR` 环境变量） |
| `server/data/seed.json` | 档口名单种子（234 个，已提交仓库） |
| `server/data/store.json` | 运行时数据（**git 忽略**，由 seed 初始化） |
| `server/uploads/` | 档口上传的图片（运行时生成，**git 忽略**） |
| `Dockerfile` | Zeabur / Render 通用构建文件 |

## 数据存储说明

当前用 JSON 文件 + 本地磁盘，数据目录由 `DATA_DIR` 控制（默认 `server/data`，线上为 `/app/data`）。`store.json` 与 `uploads/` 都落在该目录。**承载大量图片时，建议把 `uploads/` 换成对象存储（腾讯云 COS / 阿里云 OSS）**，`db.js` 与 `server.js` 的存储接口已隔离，替换实现不影响前端。
