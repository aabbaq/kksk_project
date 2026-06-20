# Backend tests

Unit and integration tests for `@kksk/api`, run with [Vitest](https://vitest.dev/) and an in-memory MongoDB ([mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)).

## Run

From repository root:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

## Layout

| Path | Coverage |
|------|----------|
| `unit/` | Hash, JWT, Zod schemas, response codes, quota & invite services |
| `integration/` | HTTP API via Supertest — auth, settings, texts, quotas, admin, health |
| `helpers/api.ts` | App factory, user seeding, auth headers |
| `setup/` | Mongo memory server + per-test DB reset |

## CI (GitHub Actions)

Workflow: `.github/workflows/deploy.yml` (single CI/CD pipeline).

| Stage | When | Notes |
|-------|------|-------|
| Tests | push/PR to `master` | Runs before build on push |
| Build & push | push to `master` only | Blocked if tests fail |
| Deploy | `DEPLOY_ENABLED=true` | Runs after build succeeds |

| Variable | Default | Effect |
|----------|---------|--------|
| `TESTS_ENABLED` | run tests | Set to `false` to skip tests (build/deploy still run) |

## Notes

- Tests use `NODE_ENV=test` and an isolated upload dir (`uploads-test`).
- OSS is disabled; storage driver is always `local` in tests.
- Integration tests reset all collections before each case.
