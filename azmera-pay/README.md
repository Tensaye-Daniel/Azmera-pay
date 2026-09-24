# Azmera Pay

Agricultural matching platform — **REGISTER → REQUEST → MATCH → CONNECT → AGREE → TRADE** — connecting farmers, agents, suppliers, and buyers.

## Monorepo layout

```
azmera-pay/
├── backend/     # Django REST Framework API (JWT auth, PostgreSQL) — structure scaffolded
├── frontend/    # React + TypeScript + Vite + Tailwind CSS (marketing landing + dashboards)
├── docs/        # architecture, API reference, domain rules
├── scripts/     # seeding / dev helpers
└── (root)       # Makefile, docker-compose.yml, .env.example
```

## Quickstart (frontend)

```sh
pnpm install:frontend   # install frontend deps once
pnpm dev                # Vite dev server (proxy /api -> localhost:8000 when backend is up)
pnpm build              # type-check + production build
pnpm lint               # eslint
pnpm preview            # serve the production build on :4173
```

## Quickstart (backend — to be implemented)

Structure is scaffolded under `backend/` (see `backend/.env.example`). Django is not installed yet — each file carries a comment describing its future role.

## Environment

- Copy `.env.example` → `backend/.env` for backend settings (later).
- Copy `.env.development`/`.env.production` → `frontend/` for the frontend (later).
- `docker-compose.yml` provides Postgres (+ Redis) for local backend development.