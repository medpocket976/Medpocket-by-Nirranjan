# MedPocket

A production-ready mobile health assistant app built with Expo (React Native) and an Express API backend, organized as a pnpm monorepo.

## Project Structure

```
artifacts/
  mobile/         — Expo React Native app (Expo Router, TypeScript)
  api-server/     — Express 5 + Drizzle ORM backend
lib/
  db/             — Drizzle schema + PostgreSQL client (shared)
  api-zod/        — Shared Zod validation schemas
  api-spec/       — API specification
  api-client-react/ — React Query API client
```

## How to Run

Two workflows are configured:

- **API Server** — `PORT=8080 pnpm --filter @workspace/api-server run dev` (port 8080, console)
- **Mobile App** — `PORT=5000 pnpm --filter @workspace/mobile run dev` (port 5000, webview)

### Manual start (from workspace root)
```bash
pnpm install                                        # install all dependencies
PORT=8080 pnpm --filter @workspace/api-server run dev   # start API server
PORT=5000 pnpm --filter @workspace/mobile run dev       # start Expo app
```

## Database

Uses Replit's built-in PostgreSQL. The `DATABASE_URL` is injected automatically — no manual setup needed.

To push schema changes:
```bash
pnpm --filter @workspace/db run push
```

Schema lives in `lib/db/src/schema/index.ts`.

## Environment Variables

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Runtime-managed | Auto-set by Replit |
| `SESSION_SECRET` | Secret | Already configured |
| `PORT` | Workflow env | Set per workflow (8080 for API, 5000 for mobile) |
| `EXPO_PUBLIC_OPENROUTER_URL` | userenv.shared | `https://openrouter.ai/api/v1` |

## User Preferences

- Keep the existing monorepo structure (pnpm workspace with `artifacts/` and `lib/`)
- Do not restructure or migrate the stack
