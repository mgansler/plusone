# Plusone — Monorepo

Nx monorepo (yarn), Node.js ≥24, TypeScript. Bundler: Vite (Frontend), NestJS (Backend). Testing: Vitest (preferred), Jest (legacy Nest projects).

## Active Projects

| App                      | Frontend        | Backend             | Status                        |
| ------------------------ | --------------- | ------------------- | ----------------------------- |
| `stgtrails`              | `stgtrails-web` | `stgtrails-backend` | **actively developed**        |
| `elgato`                 | `elgato-web`    | `elgato-backend`    | maintenance                   |
| `feeds`                  | `feeds-web`     | `feeds-backend`     | maintenance                   |
| `borgo`                  | `borgo-web`     | —                   | maintenance                   |
| `github-pipeline-status` | —               | —                   | **legacy**, skip unless asked |

## Key Directories

- `apps/` — all applications and their sub-projects (web + backend per app)
- `libs/` — shared libraries (components, hooks, api-clients, persistence, plugins)
- `libs/plugins/nx-prisma/` — custom Nx plugin for Prisma
- `tools/eslint-rules/` — custom ESLint rules
- `tools/scripts/` — shell scripts used in GitLab CI pipeline (GitHub is only a mirror)

## Running

```bash
nx run <app>:serve        # backend dev server
nx run <app>:dev          # frontend dev server (Vite)
nx run <app>:test         # run tests
nx run <app>:build        # production build
```

Or use IntelliJ run configurations.

## Prisma

Each app with a database has its own schema (`schema.prisma`). Generate client: `nx run <app>:prisma-generate`
