# Lothric Castle — 容器化部署方案

适用于阿里云 ECS：**Ubuntu 22.04 / 2 vCPU / 2 GiB / Docker 29.x**

## 架构

```
Internet :80
    │
    ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
│  nginx  │────▶│   web   │     │   api   │────▶│ MongoDB  │
│ gateway │     │  (SPA)  │     │ Express │     │  mongo:7 │
└────┬────┘     └─────────┘     └────┬────┘     └──────────┘
     │                               │
     └──────── /api /uploads ─────────┘
```

| 容器 | 镜像 | 内存上限 | 职责 |
|------|------|---------|------|
| `nginx` | `ghcr.io/.../nginx` | 48 MB | 公网入口，反向代理 |
| `web` | `ghcr.io/.../web` | 64 MB | Vue 静态资源（内网） |
| `api` | `ghcr.io/.../api` | 384 MB | Express API |
| `mongodb` | `mongo:7` | 512 MB | 数据库（WiredTiger 缓存 256 MB） |

合计约 **1 GB** 容器内存 + 系统预留，适配 2 GiB 机器。

## 部署流程概览

```
push master → GitHub Actions 构建 3 个镜像 → 推送到 GHCR
           → SSH 登录 ECS → docker compose pull → up -d
```

---

## 一、服务器首次初始化

SSH 登录阿里云 ECS 后执行：

```bash
# 克隆仓库（仅首次，用于获取初始化脚本；后续由 CI 自动部署）
git clone https://github.com/aabbaq/kksk_project.git /opt/lothric-src
bash /opt/lothric-src/docker/scripts/server-init.sh

# 创建部署目录和环境变量
mkdir -p /opt/lothric/docker
cp /opt/lothric-src/docker/deploy.env.example /opt/lothric/.env
nano /opt/lothric/.env
```

**必须修改 `.env` 中的两项：**

```env
JWT_SECRET=你的随机长字符串至少32位
CORS_ORIGIN=http://你的公网IP或域名
```

---

## 二、配置 GitHub Actions Secrets

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加：

| Secret | 说明 | 示例 |
|--------|------|------|
| `DEPLOY_HOST` | ECS 公网 IP | `47.xxx.xxx.xxx` |
| `DEPLOY_USER` | SSH 用户名 | `root` 或 `ubuntu` |
| `DEPLOY_SSH_KEY` | SSH 私钥（完整 PEM） | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | 服务器部署目录 | `/opt/lothric` |
| `DEPLOY_PORT` | SSH 端口（可选） | `22` |
| `GHCR_TOKEN` | 拉取私有镜像用 | 使用 GitHub PAT，`read:packages` 权限 |

### 生成 GHCR_TOKEN

1. GitHub → Settings → Developer settings → Personal access tokens
2. 勾选 `read:packages`（若仓库私有还需 `repo`）
3. 复制 token 填入 `GHCR_TOKEN` secret

### 配置 GHCR 包可见性

首次 push 后，在 GitHub → Packages 中将 `api`/`web`/`nginx` 包设为 **Public**（或确保 `GHCR_TOKEN` 有权限拉取私有包）。

---

## 三、触发部署

```bash
git push origin master
```

GitHub Actions 工作流 `.github/workflows/deploy.yml` 将：

1. 并行构建 `api`、`web`、`nginx` 三个镜像
2. 推送到 `ghcr.io/aabbaq/kksk_project/{api,web,nginx}:latest`
3. SSH 到 ECS，执行 `docker compose pull && up -d`

查看进度：GitHub → Actions → **Build and Deploy**

---

## 四、服务器手动运维命令

```bash
cd /opt/lothric

# 查看状态
docker compose -f docker/docker-compose.prod.yml ps

# 查看日志
docker compose -f docker/docker-compose.prod.yml logs -f api
docker compose -f docker/docker-compose.prod.yml logs -f nginx

# 手动拉取最新镜像并重启
docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d

# 停止所有服务
docker compose -f docker/docker-compose.prod.yml down

# 备份 MongoDB
docker exec lothric-mongodb-1 mongodump --db blog --out /data/db/backup
docker cp lothric-mongodb-1:/data/db/backup ./backup-$(date +%Y%m%d)
```

---

## 五、设置管理员账号

部署完成后，在服务器上执行：

```bash
docker exec -it lothric-mongodb-1 mongosh blog --eval \
  'db.users.updateOne({username:"你的用户名"},{$set:{userrole:7}})'
```

---

## 六、图片存储（可选：阿里云 OSS）

在 `/opt/lothric/.env` 中追加：

```env
STORAGE_USE_OBJECT_STORE=true
S3_BUCKET=your-bucket
S3_REGION=oss-cn-hangzhou
S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
S3_ACCESS_KEY_ID=你的AccessKey
S3_SECRET_ACCESS_KEY=你的SecretKey
S3_PUBLIC_BASE_URL=https://your-bucket.oss-cn-hangzhou.aliyuncs.com
```

然后在管理员设置页开启「对象存储」开关。

---

## 七、本地验证构建（开发机）

```bash
# 构建三个镜像
docker build -f apps/api/Dockerfile -t lothric-api:local .
docker build -f apps/web/Dockerfile -t lothric-web:local .
docker build -f docker/nginx/Dockerfile -t lothric-nginx:local .

# 本地启动（使用 dev compose + 构建的镜像需改 compose）
docker compose -f docker/docker-compose.prod.yml up -d
```

---

## 八、HTTPS（后续扩展）

2 GiB 机器建议先用 HTTP（80 端口）。需要 HTTPS 时：

- 方案 A：阿里云 SLB / CDN 终止 SSL，后端仍走 80
- 方案 B：在 `nginx` 容器挂载 certbot 证书，修改 `gateway.conf` 监听 443

---

## 文件清单

| 文件 | 用途 |
|------|------|
| `apps/api/Dockerfile` | API 多阶段构建 |
| `apps/web/Dockerfile` | 前端构建 + 内网 nginx |
| `docker/nginx/Dockerfile` | 公网入口 nginx |
| `docker/nginx/gateway.conf` | 反向代理规则 |
| `docker/nginx/web.conf` | SPA 静态资源配置 |
| `docker/docker-compose.prod.yml` | 生产编排 |
| `docker/deploy.env.example` | 服务器环境变量模板 |
| `.github/workflows/deploy.yml` | CI/CD 流水线 |
| `docker/scripts/server-init.sh` | 服务器首次初始化 |
