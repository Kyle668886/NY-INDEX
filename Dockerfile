# 南油趋势指数 —— 全栈镜像（前端 + Node 后端 + 档口上传 API）
FROM node:20-alpine

WORKDIR /app

# 先装依赖，利用 Docker 层缓存
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# 复制整个应用（前端 index.html/admin.html + 后端 server/ + 种子数据 data/）
COPY . .

ENV PORT=4000
ENV NODE_ENV=production
# 部署时请在平台环境变量里覆盖成你自己的强随机串
ENV JWT_SECRET=change_me_to_a_strong_random_string

EXPOSE 4000

# server.js 用 __dirname 定位 data/ 与 uploads/；APP_DIR 自动取父目录 (/app)
CMD ["node", "server/server.js"]
