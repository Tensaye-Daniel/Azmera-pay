# Auth pages

- `Login.tsx` - two-column sign-in (shared hero + login card), routes `/login` (agent
  variant) and `/login/supplier` (supplier variant); the hero picture is hidden on mobile
  for the supplier variant.
  - Signs in with phone/password against `POST /api/v1/auth/login`; email sign-in is not
    available yet (the field accepts it but shows an honest message).
  - Includes a "Remember me" checkbox (persists tokens in `localStorage`; otherwise
    `sessionStorage` for the tab session), a "Forgot password?" notice, and a
    demonstration-only "Continue with Fayda" button. No mock authentication is performed.
- `AgentSignup.tsx` - two-column agent sign-up (hero + 4-step wizard), route `/register/agent`.
- `SupplierSignup.tsx` - supplier contact, business, TIN and password form at `/register/supplier`; submits to `POST /api/v1/auth/register/supplier` and explains the pending approval workflow.
