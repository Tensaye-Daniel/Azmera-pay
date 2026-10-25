# Azmera API reference

This reference lists routes mounted by `backend/config/urls.py`. API routes are
under `/api/v1/`; the USSD callback is under `/ussd/`. Unless noted otherwise,
API endpoints return JSON. Invalid requests use DRF validation responses.

## Authentication and accounts

All account routes below are mounted from `apps.accounts.urls`.

| Method and path | Access | Behavior |
| --- | --- | --- |
| `POST /api/v1/auth/register` | Public | Creates an agent account. JSON fields: `full_name`, `phone`, `password`; `email` is optional. The server assigns the `agent` role. Returns `id`, `full_name`, `phone`, and `email` (never the password), with HTTP 201. Validation failures return HTTP 400 with field errors. |
| `POST /api/v1/auth/register/supplier` | Public | Creates a supplier account in `pending` approval state and its supplier profile. JSON fields: `full_name`, `phone`, `password`, `tin_number`, `company_name`; `email` is optional. TIN must be 10 digits and unique. Returns `id`, `full_name`, `phone`, `email`, `role`, `supplier_approval_status`, and a submission `message` (HTTP 201). Password and TIN are not returned. |
| `POST /api/v1/auth/login` | Public | Accepts JSON `phone` and `password`; returns an `access` and `refresh` JWT pair. Invalid credentials return HTTP 401. Pending or rejected suppliers are denied (HTTP 400). |
| `POST /api/v1/auth/token/refresh` | Public, requires a valid `refresh` token | Returns a new `access` token. Refresh is denied if a supplier is no longer approved. |
| `GET /api/v1/auth/me` | Authenticated | Returns the current user: `id`, `phone`, `email`, `full_name`, `role`, and `supplier_approval_status`. |
| `POST /api/v1/auth/logout` | Authenticated | Accepts JSON `{ "refresh": "…" }`, blacklists that user's refresh token, and returns HTTP 204 with no body. Missing, invalid, or another user's token is rejected. |

Authenticated requests use `Authorization: Bearer <access-token>`. Supplier
approval is managed through Django admin; there is no supplier-approval REST
endpoint.

## Supplier profile and catalog

### Supplier profile

`GET`, `PUT`, and `PATCH /api/v1/supplier/profile` require an authenticated,
approved supplier. The profile view rejects other roles and unapproved
suppliers. The response contains `company_name`, `region`, `woreda`, and
`product_categories`. `company_name` is read-only; updates may set `region`,
`woreda`, and `product_categories`. Setup validation requires non-empty region,
woreda, and at least one category. A missing profile returns 404.

### Catalog lookup

<<<<<<< HEAD
Both lookup endpoints require authentication, but do not restrict access to the
supplier role. They return plain JSON arrays and disable pagination.

| Method and path | Response |
| --- | --- |
| `GET /api/v1/catalog/products` | Active products, each with `id`, `name`, and `category`. |
| `GET /api/v1/catalog/units` | Units, each with `id`, `name`, and `code`. |

### Supplier listings

The list/create and detail endpoints require an authenticated supplier whose
account is approved and whose shop setup has a region, woreda, and at least one
product category. Listing queries are scoped to the current supplier.

| Method and path | Behavior |
| --- | --- |
| `GET /api/v1/catalog/supplier/listings` | Returns the current supplier's listings using DRF page-number pagination: `{ "count", "next", "previous", "results" }`. Default page size is 25; `page_size` may be set up to 100. |
| `POST /api/v1/catalog/supplier/listings` | Creates a listing and assigns its supplier from the authenticated user. Provide either a catalog `product` ID or a product `name` and `category`, plus `available_quantity`, `unit`, `unit_price`, `region`, and `woreda`. `availability_status` defaults to `active`; `notes` is optional. Returns the serialized listing with HTTP 201. |
| `GET /api/v1/catalog/supplier/listings/{uuid}` | Retrieves one of the current supplier's listings. A listing owned by another supplier is not found in this scoped queryset. |
| `PUT` or `PATCH /api/v1/catalog/supplier/listings/{uuid}` | Updates a listing owned by the current supplier and returns its serialized representation. |
| `DELETE /api/v1/catalog/supplier/listings/{uuid}` | Deletes a listing owned by the current supplier and returns HTTP 204 with no body. |

Listing responses include identifiers for the product and unit, product name
and category, unit code, quantity, unit price, region, woreda, availability
status, notes, and creation/update timestamps. Current statuses are `active`,
`paused`, and `inactive`; legacy `expired` values remain readable, but cannot
be newly selected as a status.

## Agent dashboard

These endpoints require an authenticated agent or admin. Agents see only
farmers they registered; admins may see all farmers.

| Method and path | Behavior |
| --- | --- |
| `GET /api/v1/dashboard/agent/farmers` | Paginated farmer profile list. |
| `POST /api/v1/dashboard/agent/farmers` | Registers a farmer. Required JSON fields: `full_name`, `phone`, `region`, `woreda`, `farm_size_hectares`, `primary_crop`, and `land_ownership`. Optional fields: `fayda_fin`, `gender`, `kebele`, `land_ownership_notes`, and `notes`. Send as `multipart/form-data` to attach optional documents in `farmer_id`, `field_photo`, and `farming_proof` file fields. Returns the created farmer profile with HTTP 201. |
| `GET /api/v1/dashboard/agent/farmers/summary` | Returns `total`, counts in `by_status`, and up to five recent farmer profiles. |
| `GET /api/v1/dashboard/agent/farmers/{uuid}` | Retrieves a farmer in the caller's permitted queryset. |
| `PATCH /api/v1/dashboard/agent/farmers/{uuid}` | Partially updates a permitted farmer profile. |

The farmer profile representation includes IDs, name, phone, account number,
Fayda FIN, location and farm fields, status, registering agent ID, document
metadata, and timestamps. Invalid registration/update data returns DRF
validation errors.

Uploaded documents are limited to JPEG, PNG, WebP, or PDF (5 MB by default) and
are encrypted with Fernet before being stored. The API only returns document
metadata; file bytes are never exposed as ciphertext.

## Admin dashboard

Admin-only moderation endpoints live under `/api/v1/dashboard/admin/`.

| Method and path | Behavior |
| --- | --- |
| `GET /api/v1/dashboard/admin/users/summary` | Review-queue totals: users by role, farmers by status, suppliers by approval. |
| `GET /api/v1/dashboard/admin/farmers` | Paginated farmer list including full registration details and document metadata. |
| `GET /api/v1/dashboard/admin/farmers/{uuid}` | Farmer detail for review. |
| `PATCH /api/v1/dashboard/admin/farmers/{uuid}/verify` | Approves the farmer and activates the account. |
| `GET /api/v1/dashboard/admin/farmers/{uuid}/documents/{document_uuid}` | Streams a decrypted document to an authenticated admin for review. |
| `PATCH /api/v1/dashboard/admin/suppliers/{uuid}/approve` | Approves a supplier application. |

Admin document downloads are decrypted on demand. The encryption key comes from
`FARMER_DOCUMENT_ENCRYPTION_KEY`; when it is unset, a development key is derived
from `DJANGO_SECRET_KEY`.

## USSD callback

| Method and path | Access and behavior |
| --- | --- |
| `GET /ussd/` | Public plain-text endpoint information. |
| `POST /ussd/` | Public gateway callback; no JWT is used. Accepts form, multipart, or JSON payloads. The gateway parser reads `sessionId` and `phoneNumber`; `text` and `serviceCode` may be empty. Responds as `text/plain` with `CON <message>` to continue or `END <message>` to finish. If `USSD_CALLBACK_SECRET` is configured, provide it as query parameter `token` or header `X-USSD-Secret`; a wrong/missing secret returns HTTP 403 and `END Unauthorized`. Malformed gateway payloads return an `END` response. |

## Planned functionality (no mounted API routes)

The current root URL configuration does not mount REST endpoints for farmer or
buyer requests, persisted match candidates, deals/connections/agreements/trades,
notifications, or payments. The matching engine is not an HTTP matching API,
and the supplier Requests and Matches pages are placeholders. Do not use planned
paths or payloads from older drafts as live API contracts.
=======
## USSD channel (Africa's Talking)
- `POST /ussd/` — Africa's Talking callback. Form fields: `sessionId`, `phoneNumber`, `text`, `serviceCode`. Responds with `CON <prompt>` or `END <message>`.
- `GET /ussd/` — health check for the configured callback URL.
- Optional shared secret: append `?token=...` or send `X-USSD-Secret` matching `USSD_CALLBACK_SECRET`.
- Menu language: `USSD_DEFAULT_LANGUAGE` (`am` by default, or `en`). The main menu offers option 5 to switch language for the rest of the session. Messages are clamped to `USSD_MAX_MESSAGE_LENGTH`.
- Farmer flow: My account → Request input (category, product, unit, quantity, max price, confirm) → matching runs synchronously → My matches shows the top ranked candidates.

## dashboard (per role — one workspace per role)
- `GET /api/v1/dashboard/kpis` — users, requests, trade volume
- `GET /api/v1/dashboard/users` — user list with role filters
- `GET /api/v1/dashboard/buyer/...` — buyer workspace (my produce requests, matches, deals, payments)
- `GET /api/v1/dashboard/agent/...` — agent workspace (farmers, ward, verification)
- `GET /api/v1/dashboard/supplier/...` — supplier workspace (my stock, incoming requests, connections)
- `GET /api/v1/dashboard/farmer/...` — farmer workspace (input requests, matches, deals)
- `GET /api/v1/dashboard/admin/...` — admin workspace (KPIs, moderation)
>>>>>>> 95d5713 (feat: add separate admin frontend app)
