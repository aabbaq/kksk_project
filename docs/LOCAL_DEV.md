# 本地开发与测试指南（macOS / Windows）

本文档说明如何在 **macOS** 或 **Windows** 本机进行开发与测试，包括：

- 常规本地启动（有 Docker / 无 Docker）
- 阿里云 OSS 连通性测试
- 完整项目下的封面上传验证

---

## 前置要求

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| Node.js | ≥ 20 | 运行前后端 |
| pnpm | 9.x（项目锁定 `pnpm@9.15.0`） | Monorepo 包管理 |
| Docker | 可选 | 本地 MongoDB（无 Docker 可用 Atlas 替代） |
| Git | 任意 | 克隆仓库 |

安装 pnpm：

```bash
npm install -g pnpm
```

---

## 一、获取代码与安装依赖

### macOS / Windows（通用）

```bash
git clone https://github.com/<owner>/kksk_project.git
cd kksk_project
pnpm install
```

Windows PowerShell 路径示例：

```powershell
cd D:\Work\GitHub\kksk_project
pnpm install
```

---

## 二、环境变量配置

### API：`apps/api/.env`

复制根目录 `.env.example` 中的 API 相关项，或直接编辑 `apps/api/.env`：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=kksk-dev-secret
JWT_EXPIRES_IN=3h
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:5173
```

无 Docker 时，将 `MONGODB_URI` 改为 MongoDB Atlas 连接串（见下文第四节）。

### 前端：`apps/web/.env`

开发环境默认已存在，一般无需修改：

```env
VITE_API_BASE_URL=/api
```

Vite 会把 `/api`、`/uploads`、`/static` 代理到 `http://localhost:3000`。

### OSS（可选，测试对象存储时填写）

在 `apps/api/.env` 追加（华北2 北京示例）：

```env
OSS_BUCKET=your-bucket
OSS_REGION=oss-cn-beijing
OSS_ENDPOINT=https://oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_SECRET_ACCESS_KEY=your-access-key-secret
OSS_PUBLIC_BASE_URL=https://your-bucket.oss-cn-beijing.aliyuncs.com
OSS_KEY_PREFIX=uploads/
OSS_FORCE_PATH_STYLE=false
```

> **注意：** 修改 `apps/api/.env` 后需重启 API 进程（`pnpm dev` 或 `pnpm dev:api`）。

---

## 三、启动项目

### 方式 A：有 Docker（本地 MongoDB）

**macOS / Linux：**

```bash
docker compose -f docker/docker-compose.yml up -d
pnpm dev
```

**Windows（PowerShell）：**

```powershell
docker compose -f docker/docker-compose.yml up -d
pnpm dev
```

### 方式 B：无 Docker（使用 MongoDB Atlas）

见第四节配置 Atlas 后，直接：

```bash
pnpm dev
```

### 单独启动前后端

```bash
pnpm dev:api    # 后端 http://localhost:3000
pnpm dev:web    # 前端 http://localhost:5173
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 API | http://localhost:3000/api |
| 健康检查 | http://localhost:3000/api/health |

### 停止服务

- 终端里 `Ctrl + C` 停止 dev 进程
- 若用了 Docker MongoDB：

```bash
docker compose -f docker/docker-compose.yml down
```

---

## 四、无 Docker：MongoDB Atlas 配置

API 启动必须连接 MongoDB。没有本机 Docker 时，推荐使用 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 免费 M0 集群。

### 步骤

1. 注册 Atlas，创建免费 Cluster
2. **Database Access** → 创建数据库用户和密码
3. **Network Access** → 添加 `0.0.0.0/0`（仅开发环境；生产应限制 IP）
4. **Connect → Drivers** → 复制连接串，例如：

```
mongodb+srv://用户名:密码@cluster0.xxxxx.mongodb.net/blog
```

5. 写入 `apps/api/.env` 的 `MONGODB_URI`

密码含特殊字符需 URL 编码（如 `@` → `%40`，`#` → `%23`）。

### 设置管理员（无 docker exec）

在 Atlas 网页 → **Browse Collections** → 数据库 `blog` → 集合 `users` → 找到你的用户文档，将 `userrole` 改为 `7`，保存后**重新登录**前端。

---

## 五、OSS 连通性测试

分两级：**仅测 OSS**（不需要 MongoDB）和 **完整上传流程**（需要跑项目）。

### 5.1 仅测 OSS 能否连通（推荐先做）

`@aws-sdk/client-s3` 安装在 `apps/api` 子包中，**必须在 `apps/api` 目录执行**，或在项目根目录用 `pnpm --filter` 调用。

#### macOS / Linux

```bash
cd apps/api

export OSS_BUCKET="your-bucket"
export OSS_ACCESS_KEY_ID="your-access-key-id"
export OSS_SECRET_ACCESS_KEY="your-access-key-secret"

node --input-type=module -e "
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const bucket = process.env.OSS_BUCKET;
const client = new S3Client({
  region: 'oss-cn-beijing',
  endpoint: 'https://oss-cn-beijing.aliyuncs.com',
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY,
  },
});

await client.send(new HeadBucketCommand({ Bucket: bucket }));
console.log('Bucket 可访问:', bucket);

const key = 'uploads/local-test-' + Date.now() + '.txt';
await client.send(new PutObjectCommand({
  Bucket: bucket,
  Key: key,
  Body: 'hello from local test',
  ContentType: 'text/plain',
}));
console.log('上传成功');
console.log('访问地址: https://' + bucket + '.oss-cn-beijing.aliyuncs.com/' + key);
"
```

#### Windows（PowerShell）

```powershell
cd apps\api

$env:OSS_BUCKET = "your-bucket"
$env:OSS_ACCESS_KEY_ID = "your-access-key-id"
$env:OSS_SECRET_ACCESS_KEY = "your-access-key-secret"

node --input-type=module -e "import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'; const bucket = process.env.OSS_BUCKET; const client = new S3Client({ region: 'oss-cn-beijing', endpoint: 'https://oss-cn-beijing.aliyuncs.com', credentials: { accessKeyId: process.env.OSS_ACCESS_KEY_ID, secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY } }); await client.send(new HeadBucketCommand({ Bucket: bucket })); console.log('Bucket 可访问:', bucket); const key = 'uploads/local-test-' + Date.now() + '.txt'; await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'hello from local test', ContentType: 'text/plain' })); console.log('上传成功'); console.log('访问地址: https://' + bucket + '.oss-cn-beijing.aliyuncs.com/' + key);"
```

#### 从项目根目录执行（macOS / Windows 通用）

```bash
# 先设置环境变量（Windows 用 $env:XXX = "..." 形式）
pnpm --filter @kksk/api exec node --input-type=module -e "
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
const bucket = process.env.OSS_BUCKET;
const client = new S3Client({
  region: 'oss-cn-beijing',
  endpoint: 'https://oss-cn-beijing.aliyuncs.com',
  credentials: {
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    secretAccessKey: process.env.OSS_SECRET_ACCESS_KEY,
  },
});
await client.send(new HeadBucketCommand({ Bucket: bucket }));
console.log('Bucket 可访问:', bucket);
const key = 'uploads/local-test-' + Date.now() + '.txt';
await client.send(new PutObjectCommand({
  Bucket: bucket, Key: key, Body: 'hello from local test', ContentType: 'text/plain',
}));
console.log('上传成功');
console.log('访问地址: https://' + bucket + '.oss-cn-beijing.aliyuncs.com/' + key);
"
```

#### 成功标准

- 终端输出 `Bucket 可访问` 和 `上传成功`
- 浏览器打开打印的 URL 能看到 `hello from local test`（Bucket 需公共读）

#### 常见错误

| 报错 | 原因 | 处理 |
|------|------|------|
| `Cannot find package '@aws-sdk/client-s3'` | 在错误目录执行了 `node` | 进入 `apps/api` 或用 `pnpm --filter @kksk/api exec` |
| `AccessDenied` / 403 | AK/SK 错误或 RAM 无写权限 | 检查密钥与 OSS 授权策略 |
| `NoSuchBucket` / 404 | Bucket 名称错误 | 核对 `OSS_BUCKET` |
| URL 打不开 | Bucket 非公共读 | 在阿里云控制台开启公共读，或检查 `OSS_PUBLIC_BASE_URL` |

---

### 5.2 完整项目测试 OSS 上传

#### 1. 配置 `apps/api/.env` 中的 OSS 变量（见第二节）

#### 2. 启动项目

```bash
pnpm dev
```

#### 3. 检查 API 是否识别 OSS

**macOS / Linux：**

```bash
curl http://localhost:3000/api/settings
```

**Windows（PowerShell）：**

```powershell
curl http://localhost:3000/api/settings
# 或
Invoke-RestMethod http://localhost:3000/api/settings
```

确认返回中 `capabilities.objectStore` 为 `true`。

#### 4. 开启对象存储开关

需管理员账号（`userrole = 7`）：

- **有 Docker：** `docker exec -it <mongodb容器> mongosh blog --eval 'db.users.updateOne({username:"用户名"},{$set:{userrole:7}})'`
- **无 Docker：** 在 Atlas 网页修改 `users` 集合

重新登录后，进入 **用户中心 → 设置** → 打开「对象存储」。

也可用 API（先登录获取 token）：

```bash
# 登录
curl -s -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"你的用户名","password":"你的密码"}'

# 开启对象存储（替换 <token>）
curl -X PATCH http://localhost:3000/api/settings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"imageStorageObjectStore":true}'
```

#### 5. 上传封面验证

在文章编辑器上传图片，或：

**macOS / Linux：**

```bash
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/test.jpg"
```

**Windows（PowerShell）：**

```powershell
curl -X POST http://localhost:3000/api/upload/image `
  -H "Authorization: Bearer <token>" `
  -F "image=@C:\path\to\test.jpg"
```

成功时返回 `"driver": "oss"` 且 `url` 为 OSS 地址；在浏览器打开该 URL 应能显示图片。

---

## 六、构建验证

确认代码可编译（macOS / Windows 通用）：

```bash
pnpm run build
```

---

## 七、平台差异速查

| 操作 | macOS / Linux | Windows (PowerShell) |
|------|---------------|------------------------|
| 设置环境变量 | `export VAR=value` | `$env:VAR = "value"` |
| 进入 API 目录 | `cd apps/api` | `cd apps\api` |
| 查看 API 设置 | `curl http://localhost:3000/api/settings` | 同上，或 `Invoke-RestMethod` |
| 上传测试文件路径 | `/Users/you/test.jpg` | `C:\Users\you\test.jpg` |
| 停止 dev 进程 | `Ctrl + C` | `Ctrl + C` |

---

## 八、推荐测试顺序

```text
1. pnpm install
2. （可选）OSS 脚本连通测试 — 第五节 5.1
3. 配置 MongoDB（Docker 或 Atlas）
4. 配置 apps/api/.env
5. pnpm dev
6. 注册 / 设管理员 / 开对象存储
7. 上传封面，确认 driver: "oss" 且图片 URL 可访问
8. pnpm run build（可选）
```

---

## 九、相关文档

- [容器化部署方案](./DEPLOY.md) — 生产环境部署与 GitHub Actions
- [项目结构与踩坑总结](./PROJECT_OVERVIEW.md) — 架构与部署问题汇总（若仓库内存在）
