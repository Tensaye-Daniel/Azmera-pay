# Typed axios client, JWT injector/refresh, endpoint map

- `client.ts` - axios instance, JWT injector and refresh interceptor
- `auth.ts` - `login`, `registerAgent`, `fetchMe` against the confirmed `/auth/*` endpoints
- `agentRegistration.ts` - composes the confirmed register endpoint and reports which
  fields are persisted vs collected for reviewer follow-up (no invented endpoints)
- `farmers.ts` - agent farmer CRUD
