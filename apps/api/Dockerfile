# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# bcrypt native module needs build tools on install
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# devDependencies (typescript) must be installed for tsc
ENV NODE_ENV=development

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/shared/src packages/shared/src
COPY apps/api/src apps/api/src

# "... " builds workspace deps (@kksk/shared) before @kksk/api
RUN pnpm --filter @kksk/api... build \
  && test -f packages/shared/dist/index.d.ts

# ── Production image ──
FROM node:22-bookworm-slim AS runtime

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/dist apps/api/dist

WORKDIR /app/apps/api

RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.js"]
