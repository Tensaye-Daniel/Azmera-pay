# Azmera architecture

Azmera Pay is a single repository with a React/TypeScript frontend and a Django
REST Framework backend. The API is mounted under `/api/v1/`, except for the
USSD callback at `/ussd/` and Django admin at `/admin/`. Database configuration
comes from `DB_URL`; the project uses JWT authentication for web API requests.

## Implemented vertical slices

- **Authentication and supplier onboarding:** public agent and supplier
  registration, phone/password login, token refresh, current-user lookup, and
  logout. Supplier registrations start pending and are reviewed by staff in
  Django admin.
- **Supplier workspace:** approved suppliers can complete shop setup, browse
  catalog products and units, and create, list, update, or delete their own
  inventory listings. The React supplier dashboard and listing management page
  use the shared API client.
- **Agent workspace:** agents register farmers, list and update farmers they
  registered, and view a status summary. Admin users can access the farmer
  endpoints across agents.
- **Farmer documents:** supporting files are validated, encrypted with Fernet
  (AES-128-CBC + HMAC), and stored as ciphertext in `FarmerDocument`. Admins
  review the metadata in the dedicated admin frontend and fetch decrypted bytes
  only through the admin-only download endpoint.
- **USSD:** the gateway callback parses requests, displays the account/help
  menu, and records session exchanges. The current “matches” menu response is a
  placeholder and does not retrieve persisted matches.

The backend separates these areas into Django apps under `backend/apps/` and
keeps shared API concerns in `apps/common/`. The pure ranking code is in
`backend/core/matching/`; that code is not a mounted matching REST API.

## Frontend structure

The Vite React application lives under `frontend/src/`:

- `routes/router.tsx` defines public pages, login/registration, the supplier
  dashboard and shop/listing pages, and the agent dashboard and farmer pages.
- `layouts/` and shared feature/UI components provide the role layouts and
  reusable presentation.
- `api/client.ts` provides the Axios client, JWT header, and access-token
  refresh behavior. Endpoint wrappers live in `api/auth.ts`, `api/supplier.ts`,
  and `api/farmers.ts`; `api/agentRegistration.ts` adapts the agent signup
  wizard to the smaller set of fields currently accepted by the API.
- Zustand stores client authentication state. API data is fetched by the page
  components through the typed API wrappers.

The supplier Requests and Matches pages are present as explicit placeholders;
they do not currently consume request or match APIs.

## Planned functionality

The root URL configuration does not mount HTTP API routes for farmer/buyer
requests, persisted matching candidates, deals, notifications, or payments.
The request and matching integration is not complete, and the supplier request
and match pages are not connected to backend data. These areas should be treated
as planned until their API routes, contracts, and tests are implemented.

## Development and verification

Run the backend with Django settings and dependencies described in
`backend/`; the pytest configuration is `backend/pytest.ini`. The frontend uses
pnpm scripts defined in `frontend/package.json` (`dev`, `lint`, `build`, and
`preview`). The Vite development server proxies `/api` to `http://localhost:8000`.
