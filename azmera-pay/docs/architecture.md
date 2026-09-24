# Azmera Pay — Architecture

Single-repository monolith. Backend and frontend are clearly separated but live together so a small team can ship end to end.

```
frontend/   React + TypeScript + Vite + Tailwind (pnpm)
backend/    Django + Django REST Framework + JWT + PostgreSQL (structure scaffolded)
```

## Core workflow

REGISTER → REQUEST → MATCH → CONNECT → AGREE → TRADE

Each actor gets their **own dashboard** where they create their account and input their info:

| Actor | Dashboard | What happens |
| --- | --- | --- |
| Agent | `dashboard/buyer` → backend `roles/agent` | Registers farmers, inputs & manages their info, owns a ward |
| Farmer | `pages/farmer` → `roles/farmer` | Asks for inputs (seeds, fertilizer, pesticides) |
| Supplier | `pages/supplier` → `roles/supplier` | Inputs stock/price info; matched to farmer input or buyer produce requests |
| Buyer | `pages/buyer` → `roles/buyer` | Creates a produce request with **quantity + amount**; gets matched; pays deposit |

## Flow detail

1. **Register / Input info** — everyone creates their account and fills their profile/role info from their dashboard.
2. **Farmer asks input** — a farmer `Request` (kind `input`) goes out; the backend `matching` engine finds suppliers.
3. **Matched & agree** — farmer picks from ranked candidates; when they agree, the **supplier connects the farmer** → a `Connection` is created.
4. **Buyer side** — the buyer creates a produce `Request` (kind `produce`) with the **quantity and amount** they want; the backend matches suppliers/sellers against it.
5. **Payments** — on signing the agreement the buyer sends a **% deposit**; when the full transaction completes the **balance is paid** (`Payment.kind`: `deposit` → `balance`).

## Key decisions

- **Monolith, domain-oriented apps** in `backend/apps/` — small, replaceable modules.
- **Matching engine is a pure function** (`core/matching/engine.py`) with no Django imports → unit-testable. One engine serves both farmer-input and buyer-produce matching.
- **Sync matching now**, Celery + Redis later without refactoring the app layer.
- **Payments are mocked** (`core/payments/gateway.py` + `MockGateway`) — models exist, no provider dependency; deposit + balance kinds implemented.
- **JWT auth** via djangorestframework-simplejwt; axios interceptor refreshes tokens on the frontend.
- **State management** (frontend): Zustand slices per domain; server data via the typed `api/` layer.

## Deploying later

- Django behind gunicorn, static via whitenoise.
- Postgres database; redis optional (async matching, rate limiting).
- Build `frontend/` with Vite → serve statics via Django or CDN; CORS for `/api`.