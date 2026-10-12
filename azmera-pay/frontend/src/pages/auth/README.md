# Auth pages

- `AgentLogin.tsx` - two-column agent sign-in (shared hero + login card), route `/login`.
  - Signs in with phone/password against `POST /api/v1/auth/login`; email sign-in is not
    available yet (the field accepts it but shows an honest message).
  - Includes a "Remember me" checkbox (persists tokens in `localStorage`; otherwise
    `sessionStorage` for the tab session), a "Forgot password?" notice, and a
    demonstration-only "Continue with Fayda" button. No mock authentication is performed.
- `AgentSignup.tsx` - two-column agent sign-up (hero + 4-step wizard), route `/register`.
