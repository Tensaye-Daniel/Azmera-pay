# Azmera

Agricultural matching platform built around one simple flow:

**REGISTER → REQUEST → MATCH → CONNECT → AGREE → TRADE**

Azmera connects farmers, agents, suppliers and buyers across Ethiopia, with USSD as the primary channel so any phone can take part.

## Monorepo layout

```
azmera-pay/
├── backend/     # Django REST Framework API (JWT auth, PostgreSQL) - structure scaffolded
├── frontend/    # React + TypeScript + Vite + Tailwind CSS (public site + dashboards)
├── docs/        # architecture, API reference, domain rules
├── scripts/     # seeding / dev helpers
└── (root)       # Makefile, docker-compose.yml, .env.example
```

## Documentation

- [`docs/SRS.md`](azmera-pay/docs/SRS.md) - software requirements specification (internal)
- [`docs/architecture.md`](azmera-pay/docs/architecture.md) - architecture and key decisions
- [`docs/domain.md`](azmera-pay/docs/domain.md) - domain rules and state machines
- [`docs/api.md`](azmera-pay/docs/api.md) - REST API reference

## Frontend structure

```
frontend/src/
├── App.tsx              # mounts the router
├── routes/              # router.tsx (route definitions), guards (future)
├── pages/
│   ├── public/          # LandingPage, NotFound
│   ├── auth/            # login / register (future)
│   └── {farmer,agent,buyer,supplier,admin}/   # role dashboards (future)
├── components/
│   ├── landing/         # marketing sections (Hero, About, How It Works, Buyers, Suppliers, Agents, Trust, CTA)
│   ├── layout/          # Navbar, Footer, LandingLayout
│   ├── ui/              # shared primitives (Reveal, icons)
│   └── features/        # domain widgets per role (future)
└── api/ hooks/ store/ types/ utils/ contexts/ data/   # cross-cutting (scaffolded)
```

Routing uses `react-router-dom` v7. The public landing page (`/`) is composed from `components/landing/*` and includes dedicated sections for buyers, suppliers and agents. To add a page, create a file under `pages/` and register it in `routes/router.tsx`.

## Quickstart (frontend)

```sh
pnpm install:frontend   # install frontend deps once
pnpm dev                # Vite dev server at :5173 (proxy /api -> localhost:8000 when backend is up)
pnpm build              # type-check + production build
pnpm lint               # eslint
pnpm preview            # serve the production build on :4173
```

## Quickstart (backend - to be implemented)

`backend/` is scaffolded: Django REST Framework, JWT auth and PostgreSQL models exist, but the service is not running yet. See `docs/architecture.md` and `docs/api.md`.

## Environment

- Backend: copy `.env.example` values as needed once Django is wired up.
- Frontend: the Vite dev server proxies `/api` to `http://localhost:8000`.
- `docker-compose.yml` provides Postgres (and optional Redis) locally.