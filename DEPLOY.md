# 南油趋势指数 · 线上部署指南

本项目为**全栈应用**：前端（index.html / admin.html）+ Node 后端（server/，负责档口认领、产品图上传、先审后发）。
前端所有接口都用**相对路径**（`/api/...`），部署到任何域名都会同源自动工作，无需改代码。

---

## 第一步：推送到 GitHub（已完成）

代码已推送到 `https://github.com/Kyle668886/NY-INDEX.git`（main 分支）。
如本地又有改动，提交后推送即可：

```bash
cd ~/Desktop/南油趋势指数/NY_INDEX_App
git add .
git commit -m "更新"
git push origin main
```

---

## 第二步：部署到 Render（推荐，有免费额度）

1. 打开 https://render.com → 注册/登录（可用 GitHub 授权）
2. **New → Blueprint**
3. 连接仓库 `Kyle668886/NY-INDEX`，`render.yaml` 会被自动识别
4. 点击 **Apply**，Render 自动构建 Docker 镜像
5. 构建完成后得到永久地址：`https://ny-index-xxxx.onrender.com`
6. **环境变量**（Blueprint 已声明，部署时按需确认）：
   - `DATA_DIR` = `/app/data`（数据/图片统一落在此，指向持久盘）
   - `JWT_SECRET` = 自动生成（建议部署后在控制台手动改成一个强随机串）
   - `ADMIN_PASSWORD` = 部署弹窗输入（管理员密码，强烈建议设置）
7. **持久盘**：`render.yaml` 已声明一个持久盘 `ny-persist` 挂载到 `/app/data`，无需手动添加。

> ⚠️ **套餐与持久盘的重要说明**
> - 持久盘（disk）**需要付费套餐（Starter 及以上，约 $7/月）**。免费套餐（free）不支持持久盘，文件系统是临时的——每次重新部署都会丢失档口上传的图片、审核记录、管理员账号（仅档口名单 seed 会保留）。
> - 若坚持用免费套餐：把 `render.yaml` 的 `plan: starter` 改回 `free`，并删除 `disk:` 整段（否则部署会报错）。适合纯演示，不适合正式让档口长期自助上传。
> - 免费实例闲置约 15 分钟后会休眠，下次访问有十几秒冷启动，属正常现象。

---

## 第三步（备选）：部署到 Railway / Fly.io

- **Railway**：导入仓库 → 用 `railway.json` 自动识别 Dockerfile → 部署。需付费，有试用额度。
- **Fly.io**：`fly launch`（自动用 Dockerfile）→ `fly deploy`。有免费额度。
- 两者都需在控制台挂载**持久卷**到 `/app/data`（对应 `DATA_DIR`），否则上传的图片会随重启丢失。

---

## 部署后必做

1. **管理员账号**：仓库内置默认管理员 `admin` / 强密码（见下方说明）。登录 `https://你的域名/admin.html` 审核档口产品图。
   - 内置 fallback 密码：`&qh%xqNbrS!f*HaR`（含特殊字符，注意准确输入）
   - **强烈建议**部署时在 `ADMIN_PASSWORD` 弹窗设置一个你自己的密码；或部署后在 `server/db.js` 的 `DEFAULT_ADMIN_PASSWORD` 改成你的强密码再重新部署。
   - 若想把密码换成数据库级管控，可后续在 `db.js` 增加改密接口。
2. **设置 JWT_SECRET**：在平台环境变量把 `JWT_SECRET` 设成你自己的强随机串（不要留默认值）。
3. **验收**：打开 `https://你的域名/`，用手机访问同一地址 → 「我 → 档口中心」按流程认领档口、上传产品图；用 `/admin.html` 审核通过。

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
| `server/db.js` | JSON 文件存储层（支持 `DATA_DIR` 环境变量） |
| `server/data/seed.json` | 提交的档口名单种子（234 个，不含管理员/产品） |
| `server/data/store.json` | 运行时数据（管理员+产品+档口认领状态，**git 忽略**，由 seed 初始化） |
| `server/uploads/` | 档口上传的图片（运行时生成，**git 忽略**） |
| `Dockerfile` / `render.yaml` / `railway.json` | 一键部署配置 |

## 数据存储说明

当前用 JSON 文件 + 本地磁盘，数据目录由 `DATA_DIR` 控制（默认 `server/data`，线上为持久盘 `/app/data`）。`store.json` 与 `uploads/` 都落在该目录，所以**单个持久盘即可同时持久化数据与图片**。

若要承载大量图片与高并发，建议把 `uploads/` 换成对象存储（如腾讯云 COS / 阿里云 OSS），`store.json` 换成数据库（PostgreSQL / MongoDB）。`db.js` 与 `server.js` 的存储接口已隔离，替换实现不影响前端。
