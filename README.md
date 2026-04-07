# EstateOS (frontend)

Security-first estate management UI: marketing site, role-based dashboards (resident, security guard, estate manager), and integration with the EstateOS API.

## Prerequisites

- Node.js 20+
- The [EstateOS backend](../estateOsBackend) running with MongoDB

## Environment

Create `estateOs/.env.local`:

```bash
# Required for API mode (dashboards, login, scanners)
NEXT_PUBLIC_API_URL=http://localhost:4000

# Optional: default resident code hint on the login screen
# NEXT_PUBLIC_DEMO_RESIDENT_CODE=RES-A01
```

If `NEXT_PUBLIC_API_URL` is unset, the app falls back to local demo data in `localStorage` where implemented.

## Scripts

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roles and login

The login screen selects a **role** and, for residents, an **estate-issued resident code** (e.g. `RES-A01` after seeding the backend). Guards and managers use demo subjects unless you add proper user accounts.

- **Resident** — guest passes, incidents, payments (where enabled), notifications.
- **Security Guard** — scanner, security events, manual denials, emergencies.
- **Estate Manager** — residents, visitors, incidents, payments, reports, blacklist (Settings), notifications.

## Related

- Backend setup, env vars (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`), and seed: [estateOsBackend README](../estateOsBackend/README.md).
