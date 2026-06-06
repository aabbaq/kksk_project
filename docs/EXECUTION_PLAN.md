# KKSK 重构执行计划

> 状态：**执行中**（Monorepo 脚手架与核心功能已落地）  
> 关联：[REFACTOR_PLAN.md](./REFACTOR_PLAN.md) · [BUSINESS_ANALYSIS.md](./BUSINESS_ANALYSIS.md)  
> 风格约束：**严格遵守原 Lothric Castle 深色主题、配色、文案与卡片布局**

---

## Phase 0 — 文档与脚手架

- [x] 编写本执行计划
- [x] 初始化 pnpm Monorepo（`apps/web` · `apps/api` · `packages/shared`）
- [x] 环境变量与 docker-compose（MongoDB）

---

## Phase 1 — 删除项（本轮执行）

| 任务 | 状态 | 说明 |
|------|------|------|
| 移除 UserOthers 页面与路由 | [x] | 删除占位 Tab |
| 移除 UserNews 页面与路由 | [x] | 删除占位 Tab |
| 移除 UserSelf Share/Explore 按钮 | [x] | UI 噪音 |
| 移除 Login 预填账号密码 | [x] | 安全 |
| 移除 Refresh 中转页 | [x] | 改为列表内刷新 |
| 移除 EJS 后端渲染 | [x] | 前后端分离 |
| 移除 `path` npm 依赖 | [x] | 使用 Node 内置 |
| 移除冗余 Markdown 样式 | [x] | 保留 github-markdown + darcula |
| 移除明文展示 protectedPassword | [x] | UserTexts 不再显示密码 |
| 归档旧 `src/`、`backend/` | [x] | 迁至 `legacy/` |

---

## Phase 2 — 保留并完善（本轮执行）

| 任务 | 状态 | 说明 |
|------|------|------|
| 文章 CRUD + 统一 API 路径 | [x] | `/api/text/*`、`/api/user/*` |
| 修复 JWT / DB 查询 bug | [x] | async 查询、token id |
| 分级可见性 secretLevel + hidden | [x] | 保留原模型 |
| protected 阅读密码验证 | [x] | `POST /api/text/:id/verify-password` |
| Markdown 编辑（md-editor-v3） | [x] | 深色主题编辑器 |
| 服务端 HTML 消毒 | [x] | sanitize-html |
| 封面图上传 | [x] | `POST /api/upload/image` |
| 用户中心个人页 | [x] | 保留原卡片布局 |
| 资料修改 API | [x] | `PATCH /api/user/profile` |
| 密码修改 API | [x] | bcrypt，兼容旧 MD5 |
| JWT 认证 + token 校验 | [x] | Bearer 流程 |
| 顶栏 + 浮动按钮 | [x] | 保留文案与交互 |
| 卡片式首页 | [x] | parallax、黄金比例封面 |
| 删除权限：所有者 + 管理员 | [x] | 非 admin 可删自己的文 |
| 前端风格迁移 | [x] | Vuetify3 深色 `#2D0425` |

---

## Phase 3 — 新增（高优先级，本轮执行）

| 任务 | 状态 | 说明 |
|------|------|------|
| 用户注册 | [x] | `POST /api/user/register` |
| 修改密码 API | [x] | `PATCH /api/user/password` |
| 修改资料 API | [x] | `PATCH /api/user/profile` |
| 受保护文章阅读验证 | [x] | 详情页密码门禁 |
| 图片上传 | [x] | 编辑页 file input |

---

## Phase 4 — 新增（中优先级，本轮执行）

| 任务 | 状态 | 说明 |
|------|------|------|
| 标签筛选 | [x] | 首页 chip 筛选 |
| 文章搜索 | [x] | 标题/副标题/作者/标签 |
| 分页 | [x] | `page` + `pageSize` |
| 草稿箱 | [x] | `isDraft` + `/user/drafts` |

---

## Phase 5 — 延后（低优先级，不纳入本轮）

- 评论系统
- RSS / Sitemap
- 管理后台
- 操作审计日志
- 站内通知

---

## 风格检查清单

- [x] `v-app` 深色模式
- [x] 主色 `#2D0425`，编辑 `#8CD2BC`，删除 `#FF5234`
- [x] 顶栏「Lothric Castle」「下北沢に向かう / 下北沢に着きました」
- [x] MainPicture parallax + Dark Souls 欢迎语
- [x] 卡片 `rounded-xl`、封面 1.618
- [x] 对话框「等等.」/「Yes, I AM!」
- [x] Roboto + MDI

---

## 验收标准

1. `pnpm dev` 可同时启动 web（5173）与 api（3000）
2. 注册 → 登录 → 发帖 → 浏览 → 编辑 → 删除 全流程可用
3. 受保护文章需密码才能阅读
4. 标签筛选、搜索、分页、草稿可用
5. 旧占位功能不可访问
6. UI 视觉与原项目一致
