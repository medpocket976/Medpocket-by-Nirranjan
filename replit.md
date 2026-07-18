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

Both services start automatically via configured workflows:

- **API Server** (`artifacts/api-server: API Server`) — Express server on port 8080
- **Mobile App** (`artifacts/mobile: expo`) — Expo Metro bundler; scan the QR code with Expo Go or open in web

### Manual start (from workspace root)
```bash
pnpm install                                        # install all dependencies
pnpm --filter @workspace/api-server run dev        # start API server
pnpm --filter @workspace/mobile run dev            # start Expo app
```

## Database

Uses Replit's built-in PostgreSQL. The `DATABASE_URL` is injected automatically — no manual setup needed.

To push schema changes:
```bash
pnpm --filter @workspace/db run push
```

## Environment Variables

| Variable | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Runtime-managed | Auto-set by Replit |
| `SESSION_SECRET` | Secret | Already configured |
| `PORT` | Runtime-managed | Auto-set per workflow |

## User Preferences

- Keep the existing monorepo structure (pnpm workspace with `artifacts/` and `lib/`)
- Do not restructure or migrate the stack
