# Azmera Domain rules

## Roles & dashboards
Everyone creates their account and inputs their info on their own dashboard.

- **Agent** — registers farmers, manages a ward, verifies farmer info, assists with USSD onboarding.
- **Farmer** — asks for inputs (seeds, fertilizer, pesticides); reviews matched suppliers; tracks deals.
- **Supplier** — publishes stock/price info; receives incoming farmer input requests; connects when agreed.
- **Buyer** — creates a produce request with **quantity + amount**; reviews matches; signs deals; pays deposit then balance.

Backend exposes one workspace per role: `dashboard/roles/{farmer,agent,buyer,supplier,admin}`.

## Request kinds
- `input` — a **farmer** needs agricultural inputs.
- `produce` — a **buyer** wants a quantity of produce and states the **amount** they will pay.

A request has one kind and one or more `RequestLine`s: product, quantity (with unit), budget/price, preferred max distance. Either kind is matched by the same engine.

## Matching score (engine.py)
`score = w1·product_fit + w2·distance_bonus + w3·price_fit + w4·capacity_fit + w5·rating`

Filter out candidates that cannot satisfy quantity/price; rank survivors; snapshot into `MatchCandidate` (immutable) so history is reproducible.

## Deal state machine
```
Connection (proposed) → accepted            # supplier connects the farmer once they agree
  → Agreement (terms + deposit %) → signed
    → Trade (ordered → fulfilled → paid → completed) | rejected at any gate
```

## Notifications
Events (match found, candidate accepted, supplier connected, agreement signed, trade updated) create `Notification` rows; `notifications/services.py` routes to in-app/SMS later.

## Payments (mock)
- `Payment.kind = deposit` — the % of the deal amount the buyer sends **when the agreement is signed**.
- `Payment.kind = balance` — the rest, paid when the **full transaction completes**.
- `LedgerEntry` keeps double-entry records. `core/payments/gateway.py` exposes a provider adapter — `MockGateway` returns success in dev.