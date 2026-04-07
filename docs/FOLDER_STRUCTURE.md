# EstateOS — Scalable Folder Structure (Next.js App Router)

This document defines an **industry-standard, scalable** structure for `EstateOS` using **Next.js App Router**. It is optimized for a multi-tenant SaaS with clear separation of **public marketing**, **auth**, and **role-based dashboards**, while keeping shared UI and business logic easy to reuse.

---

## Goals

- Keep routing clean with **route groups**: `(public)`, `(auth)`, `(dashboard)`
- Separate **UI components** from **domain logic**
- Make layouts reusable: marketing layout vs authenticated layout(s)
- Enable growth into modules: Security, Residents, Billing, Maintenance, Marketplace
- Keep code discoverable for teams (predictable naming + conventions)

---

## Recommended project layout (high level)

```text
estateos/
  app/
    (public)/
      layout.tsx
      page.tsx
      privacy/page.tsx
      terms/page.tsx
      support/page.tsx
      (optional) pricing/page.tsx
      (optional) features/page.tsx

    (auth)/
      layout.tsx                 # lightweight layout for auth pages (optional)
      login/page.tsx
      register/page.tsx          # optional
      forgot-password/page.tsx   # optional

    (dashboard)/
      layout.tsx                 # app shell: sidebar/topbar, role switcher
      page.tsx                   # default dashboard landing
      security/
        visitors/page.tsx
        access-logs/page.tsx
        incidents/page.tsx
        blacklist/page.tsx
      residents/
        page.tsx
        [residentId]/page.tsx
      settings/
        page.tsx

    api/
      health/route.ts
      webhooks/
        anpr/route.ts            # later: ANPR integration webhooks

  components/
    site/                        # marketing/site chrome
      Navbar.tsx
      Footer.tsx
    sections/                    # landing page sections (public)
      HeroSection.tsx
      FeaturesSection.tsx
      HowItWorksSection.tsx
      PricingSection.tsx
    dashboard/
      Sidebar.tsx
      Topbar.tsx
      TenantSwitcher.tsx
      GuardScanWidget.tsx
    ui/                          # optional: shared design system components
      Button.tsx
      Card.tsx
      Dialog.tsx

  lib/
    auth/
      rbac.ts                    # permission checks
      session.ts                 # session/JWT helpers
    tenant/
      resolveTenant.ts           # tenant from host/header
    api/
      client.ts                  # typed fetch wrapper
      errors.ts                  # error normalization
    security/
      qr.ts                      # QR token encode/decode helpers
      policies.ts                # schedule/gate policy checks
    events/
      emit.ts                    # event emission abstraction
      types.ts

  public/
    brand/
      logo.svg
      favicon.svg
    images/
      landing-hero.png

  docs/
    PRD_EstateOS.md
    FOLDER_STRUCTURE.md
```

---

## Routing conventions (App Router)

### Route groups
- **`app/(public)`**: public marketing + legal + support pages
- **`app/(auth)`**: login/register flows and callbacks
- **`app/(dashboard)`**: authenticated app shell and role-based product areas

Route groups keep URLs clean:
- `app/(public)/page.tsx` → `/`
- `app/(auth)/login/page.tsx` → `/login`
- `app/(dashboard)/security/visitors/page.tsx` → `/security/visitors`

### Layout conventions
- `app/(public)/layout.tsx`: fixed navbar + footer, section anchors, marketing spacing
- `app/(dashboard)/layout.tsx`: app shell (sidebar, topbar, role guard)
- `app/(auth)/layout.tsx`: minimal, distraction-free auth layout (optional)

---

## Component conventions

### `components/site/*`
Site chrome only (Navbar/Footer). These should not depend on dashboard logic.

### `components/sections/*`
Landing sections are small, composable, and can be reused on dedicated pages (e.g. `/features`).

### `components/dashboard/*`
Dashboard-specific UI (sidebar, widgets, tables). Avoid importing `components/site/*` here.

### `components/ui/*` (optional but recommended)
Shared design system primitives (Button, Card, Dialog). Keep them dumb and reusable.

---

## Domain and platform code (`lib/`)

Keep business logic out of React components:
- **Auth/RBAC** checks in `lib/auth/*`
- Tenant resolution in `lib/tenant/*`
- Guest invitation flow helpers in `lib/security/*`
- Events and audit correlation in `lib/events/*`

This makes it easier to test and later extract services.

---

## Public pages requirements checklist

- Navbar includes:
  - Logo → `/`
  - Anchors: `#features`, `#how-it-works`, `#pricing`
  - CTA: `Sign In` + `Get Started`
  - Mobile menu + ESC close behavior
- Footer includes:
  - Links: `/privacy`, `/terms`, `/support`
  - Copyright

---

## Why this scales

- You can add modules under `(dashboard)` without touching marketing pages.
- You can change auth providers without rewriting UI (auth stays in `(auth)`).
- Shared logic in `lib/` keeps SaaS concerns consistent: tenant isolation, auditing, events, QR policy.

