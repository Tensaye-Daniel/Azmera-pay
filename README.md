# Azmera

Azmera is an agricultural marketplace for Ethiopia that connects farmers, agents, suppliers, and buyers. Its intended workflow is **REGISTER → REQUEST → MATCH → CONNECT → AGREE → TRADE**. USSD is an important access channel for farmers using basic phones.
## Team members

| Name | ID / Handle | Contribution |
| --- | --- | --- |
| Tensaye Daniel | CTC-839-26 | Built the agent registration flow, farmer request handling, and the backend/USSD APIs for Module 1. |
| Mebatsion Nigussie | `nigussiemebatsion-sys` | Worked on supplier listings, marketplace matching, and the supplier response flow for Module 2 |

## Technology

- **Backend:** Django, Django REST Framework, PostgreSQL, JWT authentication (SimpleJWT)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Infrastructure:** Docker Compose provides PostgreSQL 16 and Redis 7. Redis is optional in the current local setup.
- **Package manager:** pnpm for the frontend and root development scripts; Python requirements files for the backend.

## Repository structure

The application monorepo is in `azmera-pay/`:

```text
.
├── README.md
└── azmera-pay/
    ├── backend/
    ├── frontend/
    ├── docs/
    ├── scripts/
    ├── docker-compose.yml
    ├── Makefile
    ├── package.json
    ├── pnpm-lock.yaml
    └── .env.example
```

## Backend

```text
backend/
├── config/                 # Django settings, root URL configuration, ASGI/WSGI
├── apps/
│   ├── accounts/           # Custom phone-based users, roles, JWT/account APIs, supplier profiles
│   ├── common/             # Shared permissions, pagination, models, phone utilities
│   ├── profiles/           # Farmer profiles and registration business logic
│   ├── channels/           # USSD callback, gateway parsing, session and interaction logging
│   ├── requests/           # Request domain placeholder; model/API flow not implemented
│   ├── catalog/            # Products, units, supplier listings and listing APIs
│   ├── matching/           # App-level matching API placeholder
│   └── dashboard/          # Role dashboard APIs; agent farmer endpoints are implemented
├── core/
│   └── matching/           # Pure matching engine, constants and orchestration placeholder
├── tests/                  # Account, agent/farmer, supplier, USSD and matching tests
├── requirements/           # Base, development and production Python dependencies
├── manage.py
└── pyproject.toml
```

The configured API currently wires accounts, agent dashboard, catalog, and USSD routes. Agent farmer registration/management and supplier listing management are implemented. The USSD callback (Africa's Talking form payloads) supports account/help menus, farmer input-request creation, synchronous matching against supplier listings, and a ranked match view, with English and Amharic menu bundles selected by `USSD_DEFAULT_LANGUAGE`. `apps/requests/` now stores requests and lines, and `apps/matching/` persists ranked candidate snapshots. The REST endpoints for requests/matching, along with deals, payments, and notifications, remain planned or partial and should not be treated as complete workflows.

## Frontend

```text
frontend/src/
├── routes/                 # React Router routes and protected-route guards
├── pages/
│   ├── public/             # Landing page and not-found page
│   ├── auth/               # Agent/supplier signup and login
│   ├── agent/              # Agent overview, farmer list/detail/create/edit, settings
│   ├── supplier/           # Supplier overview, listings, Shop Setup, requests and matches views
│   ├── farmer/             # Reserved; no farmer dashboard flow yet
│   ├── buyer/              # Reserved; no buyer dashboard flow yet
│   └── admin/              # Reserved; no admin dashboard flow yet
├── layouts/                # Agent and supplier dashboard layouts
├── components/
│   ├── landing/            # Public marketing sections
│   ├── layout/             # Shared and landing layouts/navigation
│   ├── ui/                 # Shared form, button, icon and notice components
│   └── features/           # Agent and supplier feature components
├── api/                    # Axios client and typed account/agent/supplier API calls
├── types/                  # Frontend API/domain types
├── store/                  # Zustand authentication state
├── data/                   # Frontend reference data
├── hooks/, utils/, contexts/ # Shared frontend utilities and extension points
└── App.tsx
```

Agent farmer management and supplier listing/Shop Setup pages are connected to existing backend endpoints. Supplier Requests and Matches currently show placeholder information. Farmer and buyer dashboards and their request flows remain to be implemented.

## Team members

| Name | ID / Handle | Contribution |
| --- | --- | --- |
| Tensaye Daniel | `Tensaye-Daniel` | Built the agent registration flow, farmer request handling, and the backend/USSD APIs for Module 1. |
| Mebatsion Nigussie | `nigussiemebatsion-sys` | Worked on supplier listings, marketplace matching, and the supplier response flow for Module 2. |

## Development Modules

### Module 1: Agent Registration and Farmer USSD Requests (#1)

**Owner:** Tensaye Daniel (`Tensaye-Daniel`)

- Agent JWT access and farmer registration through the Agent dashboard, including unique account numbers and duplicate validation.
- Implement USSD sessions that create Farmer input requests, and agree on the callback/session contract and Module 2 handoff.

### Module 2: Supplier Listings and Matching Dashboard (#2)

**Owner:** Mebatsion Nigussie (`nigussiemebatsion-sys`)

- Manage Supplier listings and implement deterministic matching of eligible listings to Farmer requests.
- Build Supplier match responses, including accept/decline/counteroffers, while protecting Farmer contact details until acceptance.

These assignments describe work in progress; they do not imply that the complete workflows are already available.

## Documentation

- [Software requirements specification](azmera-pay/docs/SRS.md)
- [Architecture](azmera-pay/docs/architecture.md)
- [Domain rules](azmera-pay/docs/domain.md)
- [API reference (planned)](azmera-pay/docs/api.md)

## Local development

Run commands from the repository root unless noted. Node.js, pnpm, Python, and Docker Compose must be available.

### 1. Start local infrastructure

```sh
cd azmera-pay
docker compose up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 2. Configure and run the backend

Create `backend/.env` and set at least `DJANGO_SECRET_KEY`, `DEBUG`, and `DB_URL`. For the Compose database, `DB_URL` can be `postgres://azmera:azmera@localhost:5432/azmera_pay`. USSD settings, including `USSD_GATEWAY`, are configurable in this file; the gateway defaults to `mock`.

```sh
cd azmera-pay/backend
python -m venv .venv
# Activate .venv, then:
python -m pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://localhost:8000/`; the USSD callback is at `/ussd/`.

### 3. Install and run the frontend

In another terminal, from the repository root:

```sh
cd azmera-pay
pnpm install:frontend
pnpm dev
```

The Vite development server runs at `http://localhost:5173/` and proxies `/api` requests to the backend. To check or preview a production build, run `pnpm lint`, `pnpm build`, or `pnpm preview` from `azmera-pay/`.

The root `.env.example` is a shared sample; Django reads its environment from `backend/.env`. Do not put private credentials in frontend environment variables.

