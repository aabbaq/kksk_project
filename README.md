# kksk_project — Lothric Castle

带权限分级的个人 Markdown 博客（Monorepo）？

## 结构

```
apps/web/          # Vue 3 + Vite + Vuetify 3 前端
apps/api/          # Express + TypeScript 后端
packages/shared/   # 共享类型与 Zod 校验
docs/              # 重构方案与执行计划
legacy/            # 旧版 Vue2 代码（归档）
static/            # 旧版静态图片（API 兼容托管）
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动 MongoDB（需 Docker）
docker compose -f docker/docker-compose.yml up -d

# 同时启动前后端
pnpm dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3000

## 单独启动

```bash
pnpm dev:web
pnpm dev:api
```

## 文档

- [本地开发与测试（macOS / Windows）](docs/LOCAL_DEV.md)
- [容器化部署](docs/DEPLOY.md)
- [重构方案](docs/REFACTOR_PLAN.md)
- [执行计划](docs/EXECUTION_PLAN.md)
- [业务分析](docs/BUSINESS_ANALYSIS.md)

## 环境变量

复制 `.env.example` 并按需修改 `apps/api/.env` 与 `apps/web/.env`。
