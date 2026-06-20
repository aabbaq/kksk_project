# Lothric Castle — 容器化部署方案

适用于任意 Linux VPS（文档以阿里云 ECS Ubuntu 22.04 / 2 vCPU / 2 GiB 为例）。

## 架构

```
Internet :80 / :443
    │
    ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
│  nginx  │────▶│   web   │     │   api   │────▶│ MongoDB  │
│ gateway │     │  (SPA)  │     │ Express │     │  mongo:7 │
│  (TLS)  │     └─────────┘     └────┬────┘     └──────────┘
└────┬────┘                           │
     └──────── /api /uploads ──────────┘
```

| 容器 | 镜像 | 内存上限 | 职责 |
|------|------|---------|------|
| `nginx` | `ghcr.io/<owner>/<repo>/nginx` | 48 MB | 公网入口，HTTPS 终结，反向代理 |
| `web` | `ghcr.io/<owner>/<repo>/web` | 64 MB | Vue 静态资源（内网） |
| `api` | `ghcr.io/<owner>/<repo>/api` | 384 MB | Express API |
| `mongodb` | `mongo:7` | 512 MB | 数据库 |

---

## 可配置项一览

本方案**没有写死**仓库名或服务器路径，所有关键项均可配置。

### GitHub Actions — Secrets（敏感信息）

在仓库 **Settings → Secrets and variables → Actions → Secrets** 中配置：

| Secret | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `DEPLOY_HOST` | 启用部署时必填 | 服务器 IP 或域名 | `47.xxx.xxx.xxx` |
| `DEPLOY_USER` | 启用部署时必填 | SSH 用户名 | `root` / `ubuntu` |
| `DEPLOY_SSH_KEY` | 启用部署时必填 | SSH **私钥**完整内容 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | 可选 | 服务器部署目录（优先级最高） | `/opt/myapp` |
| `DEPLOY_PORT` | 可选 | SSH 端口，默认 22 | `22` |
| `GHCR_TOKEN` | 可选 | 拉取私有镜像的 PAT（`read:packages`） | `ghp_...` |

### GitHub Actions — Variables（非敏感，可公开）

在 **Settings → Secrets and variables → Actions → Variables** 中配置：

| Variable | 默认值 | 说明 |
|----------|--------|------|
| `DEPLOY_ENABLED` | （未设置 = 不部署） | 设为 `true` 才执行 SSH 部署阶段 |
| `CORS_ORIGIN` | （启用部署时必填） | 用户访问的公网 URL（无尾斜杠），CI 每次部署写入服务器 `docker/.env` |
| `DEPLOY_PATH` | `/opt/app` | 服务器部署目录（Secret 未设置时生效） |
| `DEPLOY_COMPOSE_FILE` | `docker/docker-compose.prod.yml` | 服务器上的 compose 文件路径（相对部署目录） |

### 服务器 `.env`（`docker/.env`）

与 `docker-compose.prod.yml` 同目录，Compose 会自动加载：

```
$DEPLOY_PATH/docker/.env
$DEPLOY_PATH/docker/docker-compose.prod.yml
```

模板：`docker/deploy.env.example` → 复制为 `docker/.env`

| 变量 | 必填 | 说明 |
|------|------|------|
| `JWT_SECRET` | 是 | JWT 签名密钥（≥32 字符随机串），需在服务器手动配置 |
| `CORS_ORIGIN` | 是 | 用户访问的公网 URL（无尾斜杠）；**启用 CI 部署时由 GitHub Variable 自动写入** |
| `IMAGE_REGISTRY` | 是 | 镜像仓库前缀，CI 每次部署自动写入 | `ghcr.io/owner/repo` |
| `IMAGE_TAG` | 是 | 镜像标签，CI 自动写入 commit SHA | `latest` |
| `COMPOSE_PROJECT_NAME` | 可选 | Docker Compose 项目名（容器前缀） | `app` |
| `HTTP_PORT` | 可选 | 宿主机 HTTP 端口 | `80` |
| `HTTPS_PORT` | 可选 | 宿主机 HTTPS 端口 | `443` |

证书文件（**不写入 `.env`**，放在部署目录 `$DEPLOY_PATH/certs/`，由 compose 挂载进 nginx 容器）：

| 文件 | 说明 |
|------|------|
| `fullchain.pem` | 域名证书 + 中间证书链 |
| `privkey.pem` | 私钥（权限 `600`） |

### 初始化脚本环境变量

```bash
DEPLOY_PATH=/opt/myapp HTTP_PORT=80 HTTPS_PORT=443 bash docker/scripts/server-init.sh
```

---

## 部署流程概览

```
push master
  → GitHub Actions 并行构建 api / web / nginx
  → 推送到 ghcr.io/<owner>/<repo>/{api,web,nginx}
  → （仅当 DEPLOY_ENABLED=true 且 Secrets 齐全）
      SSH 登录服务器 → deploy-remote.sh → compose pull && up -d
```

**Fork 复用说明：** 默认只构建并推送镜像到 **你自己的** GHCR（`${{ github.repository }}` 自动适配）。不配置 SSH 时不会部署，避免报错。

---

## 一、服务器首次初始化

```bash
# 克隆仓库（仅首次，获取脚本；后续由 CI 自动同步 compose/env）
git clone https://github.com/<owner>/<repo>.git /opt/app-src

# 可自定义部署目录和端口
DEPLOY_PATH=/opt/app bash /opt/app-src/docker/scripts/server-init.sh

# 创建环境变量文件（与 compose 文件同目录）
cp /opt/app-src/docker/deploy.env.example /opt/app/docker/.env
nano /opt/app/docker/.env
```

**必须修改 `.env`（或依赖 CI 自动写入）：**

```env
JWT_SECRET=你的随机长字符串至少32位
IMAGE_REGISTRY=ghcr.io/你的用户名/你的仓库名
```

`CORS_ORIGIN` 在启用 CI 部署时由 GitHub Variable 自动写入（见下方 Variables 配置）。若手动部署，在 `docker/.env` 中设置：

```env
CORS_ORIGIN=https://你的域名
```

**启用 HTTPS 前，先在服务器放置证书（见 [六、HTTPS 证书（手动部署）](#六https-证书手动部署)）。**

---

## 二、配置 GitHub Actions

### 1. 添加 Secrets

见上方「Secrets」表格。`DEPLOY_SSH_KEY` 为登录服务器的私钥，**不是**公钥。

生成密钥对示例：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""
# 公钥写入服务器 ~/.ssh/authorized_keys
# 私钥完整内容填入 GitHub Secret DEPLOY_SSH_KEY
```

### 2. 添加 Variables

**必须**设置：

```
DEPLOY_ENABLED = true
CORS_ORIGIN = https://你的域名
```

`CORS_ORIGIN` 无尾斜杠；启用 HTTPS 时使用 `https://`。每次 CI 部署会自动同步到服务器 `docker/.env` 并重启 api 容器。

可选覆盖默认路径：

```
DEPLOY_PATH = /opt/app
```

### 3. GHCR 包可见性

首次构建后，在 GitHub → Packages 中将 `api` / `web` / `nginx` 设为 **Public**，或配置 `GHCR_TOKEN`。

---

## 三、触发部署

```bash
git push origin master
```

查看进度：GitHub → Actions → **Build and Deploy**

---

## 四、常见错误

### `can't connect without a private SSH key or password`

**原因：** deploy 阶段已执行，但 SSH 凭证未配置完整。

| 检查项 | 处理 |
|--------|------|
| 未设置 `DEPLOY_ENABLED` | 若暂不部署，**不要**设 `DEPLOY_ENABLED=true`；工作流将只构建镜像 |
| 缺少 `DEPLOY_SSH_KEY` | 在 Secrets 中添加 SSH 私钥 |
| 缺少 `DEPLOY_HOST` / `DEPLOY_USER` | 补全服务器地址和用户名 |
| 私钥格式错误 | 粘贴完整 PEM，含首尾行 |

更新后（本 PR）工作流会在 deploy 前校验 Secrets，并在 `DEPLOY_ENABLED != true` 时跳过部署。

### `error copy file to dest`（文件拷贝失败）

**原因：** SSH 已连通，但部署用户对 `DEPLOY_PATH` **没有写权限**，或路径上某层父目录不可进入。

```bash
# 将 /path/to/deploy 替换为你的 DEPLOY_PATH
DEPLOY_PATH=/path/to/deploy
SSH_USER=你的DEPLOY_USER

# 检查整条路径权限
namei -l "$DEPLOY_PATH/docker"
ls -la "$DEPLOY_PATH"

# 模拟 CI 用户测试写入
sudo -u "$SSH_USER" touch "$DEPLOY_PATH/.write-test" && echo OK
sudo -u "$SSH_USER" rm "$DEPLOY_PATH/.write-test"
```

**修复建议：**

1. 将 `DEPLOY_PATH` 设在 **SSH 用户自己的 home 目录下**（如 `/home/<user>/app`），最省事
2. 若必须用其他路径，确保目录属主为 `DEPLOY_USER`：`chown -R <user>:<user> $DEPLOY_PATH`
3. 确保父目录对 SSH 用户可进入（至少 `chmod o+x` 于中间路径）

工作流拷贝前会执行 **Write test**；失败时日志会打印 `SSH user:` 和目录列表，便于排查。

### `deploy-remote.sh: No such file or directory`

拷贝已成功，但执行脚本时工作目录不对。部署脚本位于 `$DEPLOY_PATH/docker/scripts/`，需先 `cd "$DEPLOY_PATH"` 再执行。

### `JWT_SECRET` / `IMAGE_REGISTRY is required`（但 `.env` 里明明有值）

`.env` 必须放在 **`$DEPLOY_PATH/docker/.env`**（与 compose 文件同目录），不是部署根目录。

```bash
ls -la /path/to/deploy/docker/.env   # 应存在
# 若误放在根目录，迁移：
mv /path/to/deploy/.env /path/to/deploy/docker/.env
```

`deploy-remote.sh` 会自动把根目录遗留的 `.env` 迁移到 `docker/.env`。

### `IMAGE_REGISTRY is required`

`docker/.env` 缺少 `IMAGE_REGISTRY`。手动添加或重新触发 CI（`deploy-remote.sh` 会自动写入）。

---

## 五、服务器手动运维

```bash
cd "${DEPLOY_PATH:-/opt/app}"

docker compose -f docker/docker-compose.prod.yml ps
docker compose -f docker/docker-compose.prod.yml logs -f api

# 手动拉取最新镜像并重启
docker compose -f docker/docker-compose.prod.yml pull
docker compose -f docker/docker-compose.prod.yml up -d

# 停止
docker compose -f docker/docker-compose.prod.yml down
```

容器名前缀由 `COMPOSE_PROJECT_NAME` 决定（默认 `app-api-1`、`app-mongodb-1` 等）。

---

## 六、HTTPS 证书（手动部署）

TLS 在 **nginx 网关容器** 终结。`web` / `api` / `mongodb` 仍在内网，无需单独配置证书。

### 证书存放位置

```
$DEPLOY_PATH/
├── certs/                    ← 证书目录（不进 Git，不打包进镜像）
│   ├── fullchain.pem         ← 证书 + 中间链
│   └── privkey.pem           ← 私钥
└── docker/
    ├── docker-compose.prod.yml
    └── .env
```

compose 将 `$DEPLOY_PATH/certs` 只读挂载到 nginx 容器的 `/etc/nginx/certs`。

### 首次启用 HTTPS

**1. 创建目录并上传证书**

```bash
DEPLOY_PATH=/opt/app   # 替换为你的部署目录

mkdir -p "$DEPLOY_PATH/certs"
chmod 700 "$DEPLOY_PATH/certs"

# 用 scp / SFTP / 面板上传两个文件到 $DEPLOY_PATH/certs/
chmod 644 "$DEPLOY_PATH/certs/fullchain.pem"
chmod 600 "$DEPLOY_PATH/certs/privkey.pem"
```

若 CA 分别提供 `domain.crt` 与中间证书，先在本地合并再上传：

```bash
cat domain.crt intermediate.crt > fullchain.pem
```

**2. 配置 GitHub Variable `CORS_ORIGIN`**

在仓库 **Settings → Secrets and variables → Actions → Variables** 中设置：

```
CORS_ORIGIN = https://你的域名
```

CI 部署时会自动写入服务器 `docker/.env`。若你已在服务器手动配置过，下次部署会被 Variable 覆盖。

**3. 放行端口**

- 云厂商安全组：入站 **TCP 443**
- 服务器 ufw（若启用）：`ufw allow 443/tcp`

**4. 部署含 HTTPS 配置的 nginx 镜像**

推送代码触发 CI，或服务器手动拉取：

```bash
cd "$DEPLOY_PATH"
docker compose -f docker/docker-compose.prod.yml pull nginx
docker compose -f docker/docker-compose.prod.yml up -d
```

**5. 验证**

```bash
curl -I https://你的域名
echo | openssl s_client -connect 你的域名:443 -servername 你的域名 2>/dev/null \
  | openssl x509 -noout -dates
```

浏览器访问 `https://你的域名`，确认登录与 API 正常。

> **注意：** nginx 启动时会读取证书文件。若 `certs/` 中缺少 `fullchain.pem` 或 `privkey.pem`，nginx 容器将无法启动。

### 每 90 天手动换证

证书到期前（建议提前 1～2 周）执行：

```bash
cd /opt/app   # 你的 DEPLOY_PATH

# 可选：备份旧证书
cp -a certs "certs.bak.$(date +%Y%m%d)"

# 上传新证书，覆盖同名文件
#   certs/fullchain.pem
#   certs/privkey.pem
chmod 644 certs/fullchain.pem
chmod 600 certs/privkey.pem

# 热加载 nginx（无需重启 api / web / mongodb）
DEPLOY_PATH=/opt/app bash docker/scripts/reload-nginx.sh
```

| 操作 | 是否需要 |
|------|----------|
| reload nginx | **需要**（加载新证书） |
| restart api / web / mongodb | **不需要** |
| 修改 `CORS_ORIGIN` | **不需要**（域名不变） |
| 重新构建镜像 | **不需要**（证书在挂载目录，不在镜像内） |

### nginx 行为说明

| 路径 | 行为 |
|------|------|
| `http://域名/*` | 301 跳转到 `https://` |
| `http://域名/healthz` | 返回 200（供容器健康检查，不跳转） |
| `https://域名/*` | 正常代理到 web / api |

### 常见 HTTPS 错误

**nginx 容器反复重启 / `cannot load certificate`**

证书文件缺失或路径错误。检查：

```bash
ls -la /opt/app/certs/
docker compose -f docker/docker-compose.prod.yml logs nginx
```

**浏览器提示证书有效，但 API 报 CORS 错误**

检查 GitHub Variable `CORS_ORIGIN` 是否为 `https://你的域名`（无尾斜杠），重新触发部署；或手动修改 `docker/.env` 后重启 api：

```bash
docker compose -f docker/docker-compose.prod.yml up -d api
```

---

## 七、设置管理员账号

```bash
docker exec -it app-mongodb-1 mongosh blog --eval \
  'db.users.updateOne({username:"你的用户名"},{$set:{userrole:7}})'
```

---

## 八、图片存储（可选：阿里云 OSS）

在服务器 `docker/.env` 中追加 OSS 相关变量，详见 `docker/deploy.env.example`。

---

## 九、本地验证构建

```bash
docker build -f apps/api/Dockerfile -t my-api:local .
docker build -f apps/web/Dockerfile -t my-web:local .
docker build -f docker/nginx/Dockerfile -t my-nginx:local .
```

---

## 文件清单

| 文件 | 用途 |
|------|------|
| `.github/workflows/deploy.yml` | CI/CD 流水线（可配置路径与开关） |
| `docker/scripts/deploy-remote.sh` | 服务器端部署脚本 |
| `docker/scripts/reload-nginx.sh` | 换证后热加载 nginx |
| `docker/scripts/server-init.sh` | 服务器首次初始化 |
| `docker/docker-compose.prod.yml` | 生产编排 |
| `docker/deploy.env.example` | 服务器 `.env` 模板 |
| `docker/nginx/gateway.conf` | nginx HTTPS 网关配置 |
| `docker/certs/` | 服务器证书目录（仅 `.gitkeep`，实际证书在服务器上） |
