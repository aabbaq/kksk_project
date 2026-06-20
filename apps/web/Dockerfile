# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

ENV NODE_ENV=development

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/
COPY apps/web/package.json apps/web/tsconfig.json apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared/src packages/shared/src
COPY apps/web apps/web

# Production build: API requests go through gateway nginx at /api
ARG VITE_GITHUB_URL=https://github.com/aabbaq/kksk_project
ENV VITE_API_BASE_URL=/api
ENV VITE_GITHUB_URL=$VITE_GITHUB_URL

RUN pnpm --filter @kksk/web... build \
  && test -f packages/shared/dist/index.d.ts

# ── Runtime: internal nginx serving static SPA ──
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx/web.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
