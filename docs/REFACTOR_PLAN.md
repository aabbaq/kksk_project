# KKSK 项目重构方案

> 状态：已认可，待分阶段实施  
> 最后更新：2026-06-06

## 1. 背景与目标

当前项目为单体仓库，前后端依赖混写在根目录 `package.json` 中，技术栈偏旧（Vue 2、Vue CLI 4、Mongoose 5），目录按技术层（`plugins/`）而非业务域组织。

### 重构目标

1. **依赖分离**：前端、后端、共享包各自维护 `package.json`
2. **技术升级**：迁移到当前稳定版本
3. **目录清晰**：按业务域 + 技术层组织，便于测试、CI、Docker
4. **业务兼容**：保留博客核心能力（文章 CRUD、登录、权限、Markdown），降低迁移成本

---

## 2. 新技术栈

| 层级 | 当前 | 目标 | 说明 |
|------|------|------|------|
| 运行时 | 未锁定 | **Node 20 LTS** | 长期支持 |
| 包管理 | npm | **pnpm 9 + workspaces** | Monorepo 友好 |
| 前端框架 | Vue 2.6 | **Vue 3.5** | 官方主推 |
| 构建 | Vue CLI 4 | **Vite 6** | 更快、配置更简单 |
| UI | Vuetify 2 | **Vuetify 3.7** | 与 Vue 3 配套 |
| 状态 | Vuex 3 | **Pinia 2** | Vue 3 推荐 |
| 路由 | Vue Router 3 | **Vue Router 4** | 配套 Vue 3 |
| HTTP | Axios 0.21 | **Axios 1.7** | 安全补丁、类型更好 |
| 语言 | JavaScript | **TypeScript 5.4** | 前后端共享类型 |
| Markdown 编辑 | vue-simplemde | **md-editor-v3** | Vue 3 支持、维护活跃 |
| 代码高亮 | highlight.js 10 | **shiki** 或 highlight.js 11 | 效果更好 |
| 后端 | Express 4.17 | **Express 4.21** | 渐进迁移，保持熟悉度 |
| 数据库 | Mongoose 5 | **Mongoose 8** | 适配新 MongoDB 驱动 |
| 认证 | jsonwebtoken 8 | **jsonwebtoken 9** 或 **jose** | 更安全 |
| 密码 | MD5 | **bcrypt** | 不可逆、带盐 |
| 校验 | 无 | **Zod** | 前后端共享 schema |
| 配置 | 硬编码 localhost | **dotenv + .env.example** | 环境可配置 |

> 未采用 NestJS / Nuxt，是为控制迁移量；后续可按模块逐步演进。

---

## 3. Monorepo 目录结构

```
kksk_project/
├── package.json                 # 根：workspaces、统一脚本
├── pnpm-workspace.yaml
├── .env.example
├── tsconfig.base.json
├── README.md
│
├── apps/
│   ├── web/                     # 前端 SPA
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   ├── public/
│   │   └── src/
│   │       ├── main.ts
│   │       ├── App.vue
│   │       ├── assets/
│   │       ├── components/
│   │       │   ├── blog/        # BlogList, BlogEditor, BlogDetail
│   │       │   ├── auth/        # LoginForm
│   │       │   ├── user/        # UserLayout, UserProfile, UserTexts
│   │       │   └── layout/      # TopBar, FootBar, FunctionButton
│   │       ├── composables/
│   │       ├── router/
│   │       ├── stores/          # Pinia（auth 等）
│   │       ├── api/             # client.ts, user.ts, text.ts
│   │       ├── plugins/
│   │       └── styles/
│   │
│   └── api/                     # 后端服务
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── app.ts
│           ├── config/env.ts
│           ├── middleware/      # cors, auth, error-handler
│           ├── modules/
│           │   ├── user/        # routes, controller, service
│           │   └── text/
│           ├── models/          # user.model.ts, text.model.ts
│           ├── db/connection.ts
│           └── utils/           # hash, token, response
│
├── packages/
│   └── shared/                  # 前后端共享
│       └── src/
│           ├── types/
│           ├── constants/
│           └── schemas/         # Zod 校验
│
├── static/                      # 博客图片（或迁至 apps/web/public/images）
└── docker/
    ├── docker-compose.yml
    └── Dockerfile.api
```

---

## 4. 依赖分布

### 根 `package.json`（仅工具链）

```json
{
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "dev:web": "pnpm --filter @kksk/web dev",
    "dev:api": "pnpm --filter @kksk/api dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint"
  }
}
```

### `apps/web/package.json`

- vue, vue-router, pinia, vuetify, axios, md-editor-v3
- @kksk/shared (workspace)

### `apps/api/package.json`

- express, mongoose, jsonwebtoken, bcrypt, zod, cors, dotenv
- @kksk/shared (workspace)

### `packages/shared/package.json`

- zod, 类型定义与常量（无运行时重型依赖）

---

## 5. 架构关系

```
apps/web (Vue 3 + Vite)
    │
    ├── 读取 packages/shared（类型、校验 schema）
    │
    └── HTTP → apps/api (Express + TS)
                    │
                    └── MongoDB (blog 库)
```

### 环境变量

```env
# apps/api/.env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=3h

# apps/web/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

开发时 Vite proxy：

```ts
// apps/web/vite.config.ts
server: {
  proxy: { '/api': 'http://localhost:3000' }
}
```

---

## 6. 旧代码迁移映射

| 旧路径 | 新路径 |
|--------|--------|
| `src/main.js` | `apps/web/src/main.ts` |
| `src/plugins/store.js` | `apps/web/src/stores/auth.ts` |
| `src/plugins/router.js` | `apps/web/src/router/index.ts` |
| `src/plugins/api-methods.js` | `apps/web/src/api/*.ts` |
| `src/components/HelloWorld.vue` | `apps/web/src/components/blog/BlogList.vue` |
| `src/components/PostEdit.vue` | `apps/web/src/components/blog/BlogEditor.vue` |
| `src/components/TextContent.vue` | `apps/web/src/components/blog/BlogDetail.vue` |
| `src/components/Login.vue` | `apps/web/src/components/auth/LoginForm.vue` |
| `backend/rapp.js` | `apps/api/src/index.ts` + `app.ts` |
| `backend/routes/user.js` | `apps/api/src/modules/user/` |
| `backend/routes/text.js` | `apps/api/src/modules/text/` |
| `backend/mongodb.js` | `apps/api/src/models/` + `db/` |
| `backend/hash.js` | `apps/api/src/utils/hash.ts`（bcrypt） |
| `backend/webtoken.js` | `apps/api/src/utils/token.ts` + `middleware/auth.ts` |

---

## 7. API 路径规范（重构后统一）

| 模块 | 路径 | 方法 |
|------|------|------|
| 用户 | `/api/user/login` | POST |
| 用户 | `/api/user/me` | GET |
| 用户 | `/api/user/token-check` | POST |
| 文章 | `/api/text` | GET（列表） |
| 文章 | `/api/text` | POST（创建） |
| 文章 | `/api/text/:id` | GET / PUT / DELETE |
| 文章 | `/api/text/by-number/:number` | GET |

> 重构时统一路径前缀，修复当前前端部分接口缺少 `/user`、`/text` 前缀的问题。

---

## 8. 分阶段实施计划

### Phase 1 — 脚手架

- [ ] 初始化 pnpm workspace
- [ ] 创建 `apps/web`、`apps/api`、`packages/shared` 空壳
- [ ] 配置 TypeScript、ESLint、环境变量
- [ ] 添加 `docker-compose.yml`（MongoDB）

### Phase 2 — 后端迁移

- [ ] Express 路由迁至 `apps/api`
- [ ] Mongoose 模型 TypeScript 化
- [ ] MD5 → bcrypt（含旧密码迁移策略）
- [ ] 修复现有后端 bug（见 `docs/BUSINESS_ANALYSIS.md`）
- [ ] API 路径统一

### Phase 3 — 前端迁移

- [ ] Vue 2 → Vue 3
- [ ] Vuex → Pinia
- [ ] Vuetify 2 → 3（逐页迁移）
- [ ] 替换 vue-simplemde → md-editor-v3
- [ ] API 调用层统一

### Phase 4 — 收尾

- [ ] 删除旧 `src/`、`backend/`（迁移验证通过后）
- [ ] 更新 README
- [ ] 补充基础测试

---

## 9. 破坏性变更与应对

| 变更 | 影响 | 处理方式 |
|------|------|----------|
| Vuetify 2 → 3 | 组件 API 变化 | 按页面逐个迁移 |
| Vue 2 → 3 | 全局注册、filters | `createApp` + 组合式 API |
| MD5 → bcrypt | 旧用户无法直接登录 | 登录成功后升级哈希，或强制重置 |
| Mongoose 5 → 8 | 废弃选项 | 按新 API 改写 |
| API 路径统一 | 前端需全部更新 | 集中在 `api/` 层修改 |

---

## 10. 开发命令（目标态）

```bash
pnpm install
pnpm dev          # 同时启动 web + api
pnpm dev:web      # 仅前端（Vite，默认 5173）
pnpm dev:api      # 仅后端（默认 3000）
pnpm build        # 构建全部
```
