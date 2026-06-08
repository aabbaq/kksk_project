# Lothric Castle — 容器化部署方案

适用于任意 Linux VPS（文档以阿里云 ECS Ubuntu 22.04 / 2 vCPU / 2 GiB 为例）。

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
| `nginx` | `ghcr.io/<owner>/<repo>/nginx` | 48 MB | 公网入口，反向代理 |
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
| `OSS_ACCESS_KEY_ID` | 可选 | 阿里云 OSS AccessKey ID | `LTAI...` |
| `OSS_SECRET_ACCESS_KEY` | 可选 | 阿里云 OSS AccessKey Secret | `...` |

### GitHub Actions — Variables（非敏感，可公开）

在 **Settings → Secrets and variables → Actions → Variables** 中配置：

| Variable | 默认值 | 说明 |
|----------|--------|------|
| `DEPLOY_ENABLED` | （未设置 = 不部署） | 设为 `true` 才执行 SSH 部署阶段 |
| `DEPLOY_PATH` | `/opt/app` | 服务器部署目录（Secret 未设置时生效） |
| `DEPLOY_COMPOSE_FILE` | `docker/docker-compose.prod.yml` | 服务器上的 compose 文件路径（相对部署目录） |
| `STORAGE_USE_OBJECT_STORE` | （未设置） | 设为 `true` 时默认启用对象存储（仍须在管理后台确认开关） |
| `OSS_BUCKET` | （未设置） | OSS Bucket 名称 |
| `OSS_REGION` | （未设置） | OSS 区域，如 `oss-cn-beijing`（华北2 北京） |
| `OSS_ENDPOINT` | （未设置） | OSS Endpoint，如 `https://oss-cn-beijing.aliyuncs.com` |
| `OSS_PUBLIC_BASE_URL` | （未设置） | 公共读访问前缀，如 `https://<bucket>.oss-cn-beijing.aliyuncs.com` |
| `OSS_KEY_PREFIX` | `uploads/` | 对象键前缀 |
| `OSS_FORCE_PATH_STYLE` | `false` | 路径风格访问（阿里云 OSS 一般为 `false`） |

启用 OSS 时，CI 部署阶段会把上述变量与 Secrets 写入服务器 `docker/.env`（与 `IMAGE_REGISTRY` 相同机制）。

### 服务器 `.env`（`docker/.env`）

与 `docker-compose.prod.yml` 同目录，Compose 会自动加载：

```
$DEPLOY_PATH/docker/.env
$DEPLOY_PATH/docker/docker-compose.prod.yml
```

模板：`docker/deploy.env.example` → 复制为 `docker/.env`

| 变量 | 必填 | 说明 |
|------|------|------|
| `JWT_SECRET` | 是 | JWT 签名密钥（≥32 字符随机串） |
| `CORS_ORIGIN` | 是 | 用户访问的公网 URL（无尾斜杠） |
| `IMAGE_REGISTRY` | 是 | 镜像仓库前缀，CI 每次部署自动写入 | `ghcr.io/owner/repo` |
| `IMAGE_TAG` | 是 | 镜像标签，CI 自动写入 commit SHA | `latest` |
| `COMPOSE_PROJECT_NAME` | 可选 | Docker Compose 项目名（容器前缀） | `app` |
| `HTTP_PORT` | 可选 | 宿主机 HTTP 端口 | `80` |

### 初始化脚本环境变量

```bash
DEPLOY_PATH=/opt/myapp HTTP_PORT=8080 bash docker/scripts/server-init.sh
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

**必须修改 `.env`：**

```env
JWT_SECRET=你的随机长字符串至少32位
CORS_ORIGIN=http://你的公网IP或域名
IMAGE_REGISTRY=ghcr.io/你的用户名/你的仓库名
```

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
```

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

## 六、设置管理员账号

```bash
docker exec -it app-mongodb-1 mongosh blog --eval \
  'db.users.updateOne({username:"你的用户名"},{$set:{userrole:7}})'
```

---

## 七、图片存储（可选：阿里云 OSS）

推荐在 **GitHub Secrets / Variables** 中配置（见上文「可配置项一览」），由 CI 自动写入服务器 `docker/.env`。也可在服务器上手动编辑 `docker/.env`，模板见 `docker/deploy.env.example`。

**华北2（北京）示例：**

```env
STORAGE_USE_OBJECT_STORE=true
OSS_BUCKET=your-bucket
OSS_REGION=oss-cn-beijing
OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY_ID=...
OSS_SECRET_ACCESS_KEY=...
OSS_PUBLIC_BASE_URL=https://your-bucket.oss-cn-beijing.aliyuncs.com
OSS_KEY_PREFIX=uploads/
OSS_FORCE_PATH_STYLE=false
```

部署完成后：

1. 使用管理员账号登录（见「六、设置管理员」）
2. 进入 **用户中心 → 设置**，打开「对象存储」开关
3. 发布或编辑文章，上传封面图验证 OSS URL 是否正常显示

---

## 八、本地验证构建

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
| `docker/scripts/server-init.sh` | 服务器首次初始化 |
| `docker/docker-compose.prod.yml` | 生产编排 |
| `docker/deploy.env.example` | 服务器 `.env` 模板 |
