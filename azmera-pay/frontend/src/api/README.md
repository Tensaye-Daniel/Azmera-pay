# Frontend API layer

The frontend makes requests through `src/api/client.ts`, an Axios instance with
`baseURL: '/api/v1'` and JSON content type. Its request interceptor reads the
access token from the Zustand auth store and sends `Authorization: Bearer …`.
For a 401 response outside `/auth/`, it attempts one token refresh using the
stored refresh token, retries the original request once, and logs out if refresh
fails. Public registration and login calls use the same client without needing
an existing access token.

## API modules

- `auth.ts` wraps agent registration, supplier registration, login, current-user
  lookup, and authenticated logout. Supplier signup submits the documented
  registration fields and receives a pending-review result; approval itself is
  performed in Django admin, not through a frontend API call.
- `supplier.ts` wraps the supplier profile (`GET/PATCH /supplier/profile`),
  product and unit lookups (`/catalog/products`, `/catalog/units`), and
  listing list/create/update/delete operations under
  `/catalog/supplier/listings`. The backend also supports GET on a listing
  detail path, but the current client has no separate fetch-by-ID helper. The
  list response is paginated at 25 per page by default. The
  `fetchSupplierListings()` helper follows each response's `next` URL until all
  pages are loaded, and rejects pagination URLs outside the API or repeated
  page URLs rather than returning partial inventory as complete.
- `farmers.ts` wraps the agent farmer list, create, detail, update, and summary
  routes under `/dashboard/agent/farmers`.
- `agentRegistration.ts` maps the agent signup wizard to the fields actually
  persisted by `POST /auth/register`. It explicitly records other wizard fields
  as pending review data; they are not sent to or stored by that endpoint.

The API base path is added by the shared client, so wrappers use paths relative
to `/api/v1` (for example, `/catalog/units`). Endpoint behavior and access
requirements are documented in [`docs/api.md`](../../../docs/api.md).

The supplier Requests and Matches pages do not yet have API wrappers because
those backend routes are not mounted. They are placeholders, not live data.
