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

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
