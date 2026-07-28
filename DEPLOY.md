# 南油趋势指数 · 线上部署指南

本项目已升级为**全栈应用**：前端（index.html / admin.html）+ Node 后端（server/，负责档口认领、产品图上传、先审后发）。
前端所有接口都用**相对路径**（`/api/...`），所以部署到任何域名都会同源自动工作，无需改代码。

> ⚠️ 重要：本项目需要从 GitHub 拉取代码部署。请先把整个 `NY_INDEX_App` 目录推送到你的 GitHub 仓库（见下方「第一步」）。

---

## 第一步：推送到 GitHub

在终端（你自己的电脑，不在 AI 里）执行：

```bash
cd ~/Desktop/南油趋势指数/NY_INDEX_App
git init                       # 如果还没初始化
git add .
git commit -m "南油趋势指数 全栈版"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库.git
git push -u origin main
```

---

## 第二步（推荐）：部署到 Render（有免费额度）

1. 打开 https://render.com → 注册/登录（可用 GitHub 授权）
2. **New → Blueprint**
3. 连接你的 GitHub 仓库，选中 `render.yaml` 会被自动识别
4. 点击 **Apply**，Render 会自动构建 Docker 镜像
5. 构建完成后会得到一个 `https://ny-index-xxxx.onrender.com` 的永久地址
6. 在 Render 控制台该服务的 **Disks** 里添加 2 个磁盘（否则每次重启图片会丢）：
   - `ny-data` → Mount Path：`/app/server/data`
   - `ny-uploads` → Mount Path：`/app/server/uploads`

> 免费实例在闲置约 15 分钟后会休眠，下次访问有十几秒冷启动，属正常现象。

---

## 第二步（备选）：部署到 Railway / Fly.io

- **Railway**：导入仓库 → 用 `railway.json` 自动识别 Dockerfile → 部署。Railway 现在需付费，但提供试用额度。
- **Fly.io**：安装 `flyctl` → `fly launch`（会自动用 Dockerfile）→ `fly deploy`。有免费额度。

两者都需在控制台挂载**持久卷**到 `/app/server/data` 和 `/app/server/uploads`，否则上传的图片会随重启丢失。

---

## 部署后必做

1. **改管理员密码**：默认管理员 `admin / admin888`。登录 `https://你的域名/admin.html` 后第一件事是改密码（在 `server/db.js` 的 `ensureDefaultAdmin` 里改成你自己的强密码再部署，或用环境变量覆盖）。
2. **设置 JWT_SECRET**：在平台环境变量里把 `JWT_SECRET` 设成一个你自己的强随机串（不要留默认值）。
3. **验收**：打开 `https://你的域名/`，用手机访问同一个地址 → 进入「我 → 档口中心」按流程认领档口、上传产品图；用 `/admin.html` 审核通过。

---

## 本地运行（开发 / 临时给手机访问）

```bash
cd ~/Desktop/南油趋势指数/NY_INDEX_App/server
npm install
node server.js                 # 默认 http://localhost:4000
```

想让手机在外网也能访问，在你**自己电脑**的终端另开一个窗口跑隧道（AI 环境里跑不了，因为沙箱拦截了长连接）：

```bash
npx localtunnel --port 4000   # 会给你一个 https://xxxx.loca.lt 公网地址
```

---

## 目录说明

| 路径 | 作用 |
|------|------|
| `index.html` / `app.js` / `styles.css` | 前端主应用 |
| `admin.html` | 管理员审核台 |
| `server/server.js` | Express 后端 + API + 托管前端 |
| `server/db.js` | JSON 文件存储层 |
| `server/data/store.json` | 档口名单(234个)+产品图+管理员 |
| `server/uploads/` | 档口上传的图片 |
| `Dockerfile` / `render.yaml` / `railway.json` | 一键部署配置 |

## 数据存储说明

当前用 JSON 文件 + 本地磁盘，适合 MVP / 中小规模。若要承载大量图片与高并发，建议把 `uploads/` 换成对象存储（如腾讯云 COS / 阿里云 OSS），`store.json` 换成数据库（PostgreSQL / MongoDB）。代码里 `db.js` 与 `server.js` 的存储接口已隔离，替换实现不影响前端。
