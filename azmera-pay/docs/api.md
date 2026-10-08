# Azmera API reference (planned, version 1 under /api/v1/)

All endpoints return JSON. Auth: `Authorization: Bearer <JWT>` after login.

## accounts
- `POST /api/v1/auth/register` — create user (phone, email, role)
- `POST /api/v1/auth/login` — returns access/refresh JWT
- `POST /api/v1/auth/token/refresh` — refresh access token
- `GET  /api/v1/auth/me` — current user

## profiles
- `GET/PATCH /api/v1/me/profile` — own role profile
- `GET  /api/v1/users/{id}/profile` — public role profile
- `PATCH /api/v1/agents/ward` — agent manages a ward

## catalog
- `GET /api/v1/products` — list/filter (category, price range, qty)
- `GET /api/v1/products/{id}` — detail
- `CRUD /api/v1/availability` — supplier stock + price + validity

## requests
- `POST /api/v1/requests` — create input or produce request (kind, lines)
- `GET/PATCH /api/v1/requests/{id}` — read/update own request
- `POST /api/v1/requests/{id}/cancel` — cancel
- `GET  /api/v1/requests` — list by role (mine, inbox)

## matching
- `POST /api/v1/requests/{id}/run-match` — trigger sync matching
- `GET  /api/v1/requests/{id}/candidates` — ranked candidates + score breakdown
- `POST /api/v1/candidates/{id}/accept` / `reject`

## deals
- `POST /api/v1/candidates/{id}/connect` — open a Connection
- `POST /api/v1/connections/{id}/agreements` — propose an Agreement
- `POST /api/v1/agreements/{id}/trades` — start a Trade
- `GET  /api/v1/deals` — my connections/agreements/trades

## notifications
- `GET /api/v1/notifications` — my notifications
- `POST /api/v1/notifications/read` — mark read

## payments (mock)
- `POST /api/v1/payments` — create payment record (kind: `deposit` | `balance`)
- `POST /api/v1/payments/{id}/verify` — verify with gateway
- `GET /api/v1/payments` — payment history

## dashboard (per role — one workspace per role)
- `GET /api/v1/dashboard/kpis` — users, requests, trade volume
- `GET /api/v1/dashboard/users` — user list with role filters
- `GET /api/v1/dashboard/buyer/...` — buyer workspace (my produce requests, matches, deals, payments)
- `GET /api/v1/dashboard/agent/...` — agent workspace (farmers, ward, verification)
- `GET /api/v1/dashboard/supplier/...` — supplier workspace (my stock, incoming requests, connections)
- `GET /api/v1/dashboard/farmer/...` — farmer workspace (input requests, matches, deals)
- `GET /api/v1/dashboard/admin/...` — admin workspace (KPIs, moderation)