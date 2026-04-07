# EstateOS — Secure Smart Estate Management SaaS  
**Product Requirements Document (PRD)**  

- **Version**: 1.0 (Security‑First Foundation)  
- **Positioning**: Secure Smart Estate Operating System (not just property management)  
- **Core philosophy**: *Invisible Security, Visible Luxury*  
- **Target markets**: USA (high‑end gated), Dubai (elite towers/villas), emerging luxury hubs  
- **Working names**: EstateOS / SecureEstate / GateFlow  

---

## Table of Contents

- [1. Product Overview](#1-product-overview)
- [2. Objectives, Goals, and Success Metrics](#2-objectives-goals-and-success-metrics)
- [3. Target Users & Personas](#3-target-users--personas)
- [4. Problem Statement](#4-problem-statement)
- [5. Solution Overview](#5-solution-overview)
- [6. Scope](#6-scope)
- [7. Functional Requirements (MVP)](#7-functional-requirements-mvp)
- [8. Phase 1 Security & Access Module (Luxury‑grade)](#8-phase-1-security--access-module-luxurygrade)
- [9. Future Features & Roadmap](#9-future-features--roadmap)
- [10. Technical Requirements](#10-technical-requirements)
- [11. System Architecture](#11-system-architecture)
- [12. Data Model & Multi‑Tenant Strategy](#12-data-model--multitenant-strategy)
- [13. Security Requirements](#13-security-requirements)
- [14. UX Requirements](#14-ux-requirements)
- [15. Key User Flows](#15-key-user-flows)
- [16. Analytics & Reporting](#16-analytics--reporting)
- [17. Business Model](#17-business-model)
- [18. Testing Strategy](#18-testing-strategy)
- [19. Risks & Mitigation](#19-risks--mitigation)
- [20. Timeline](#20-timeline)
- [21. API Documentation Starter: Guest Invitation “Heartbeat”](#21-api-documentation-starter-guest-invitation-heartbeat)

---

## 1. Product Overview

### 1.1 Vision
Build a **security‑first, modern estate operating system** that enables estate managers, security personnel, and residents to manage and interact with estate infrastructure efficiently and safely.

### 1.2 Mission
Eliminate inefficiencies, security risks, and poor user experiences in estate management through a **centralized, intelligent SaaS platform**.

### 1.3 What “Operating System” means here
EstateOS is designed as a **modular core**:
- The **Security Module** ships first (pro‑installed “app”).
- The foundation is built to later add **Property Management**, **Financing/Payments**, **Maintenance**, and an **Artisan Marketplace** without re‑architecting core identity, tenancy, events, permissions, and auditing.

---

## 2. Objectives, Goals, and Success Metrics

### 2.1 Primary goals
- Provide **secure access control** for estates
- **Digitize estate operations**
- Enable **real‑time monitoring and communication**
- Build a **scalable multi‑tenant SaaS** platform

### 2.2 Success metrics (KPIs)
- **Visitor entries processed digitally** (%)
- **Reduction in unauthorized access incidents**
- **Monthly Active Users (MAU)** by role (Resident/Guard/Admin)
- **Estate onboarding rate** (time to onboard + conversion)
- **Payment completion rate** (when Payments module is active)

---

## 3. Target Users & Personas

### 3.1 Estate Manager / Admin
- **Responsibilities**: manage residents, units, payments, reports, settings, roles
- **Needs**: control, visibility, insights, auditability, exportable reports

### 3.2 Security Personnel (Guard)
- **Responsibilities**: validate visitor access, handle incidents, log entries/exits
- **Needs**: speed (3‑second scan), clarity, simplicity, offline resiliency

### 3.3 Residents (Tenants / Owners)
- **Responsibilities**: invite visitors, manage access passes, receive alerts, report issues, make payments
- **Needs**: convenience, trust, privacy, “luxury feel” UX

### 3.4 Chief Security Officer (CSO) / Command Center
- **Responsibilities**: oversee all gates, manage blacklists, monitor traffic, review incidents, audit activity
- **Needs**: real‑time overview, quick escalation, high signal analytics, strong controls

---

## 4. Problem Statement

Most estate management setups today:
- Lack proper **security infrastructure** (weak identity + no auditing + no real gate workflow)
- Are **fragmented** across multiple tools (WhatsApp, paper logs, spreadsheets)
- Have **poor UX** for guards and residents
- Don’t support modern “smart estate” needs (events, integrations, automation, privacy)

---

## 5. Solution Overview

EstateOS is a centralized platform that provides:
- **Secure authentication & access control** (RBAC + audit trails)
- **Real‑time estate activity tracking** (events + logs)
- **Resident and visitor management**
- **Payments & document handling** (MVP: tracking; later: full billing)
- **Scalable SaaS infrastructure** (multi‑tenant core + modular services)

---

## 6. Scope

### 6.1 MVP (Phase 1) scope summary
Security‑first foundation focused on:
- Authentication + authorization
- Resident management
- Visitor access control (QR) + entry/exit logs
- Guard dashboard + basic CSO web command center views
- Incident reporting
- Notifications
- Basic payments/billing tracking (if enabled for early pilots)

### 6.2 Out of scope for MVP (unless required by pilot)
- Full accounting/ledgering, refunds, charge disputes
- Deep IoT / CCTV integrations (planned Phase 2)
- AI assistant + predictive analytics (planned Phase 3)

---

## 7. Functional Requirements (MVP)

### 7.1 Authentication & Authorization
- **Email + password login**
- **Role‑Based Access Control (RBAC)** across all features
- **Optional MFA** (can be feature‑flagged for MVP)
- **Session/JWT strategy**: secure, revocable authentication (see Security Requirements)

**Roles (minimum)**
- Resident
- Guard
- Estate Manager (Admin)
- CSO (can be a specialized Admin role)

### 7.2 Resident Management
- Create/read/update resident profiles
- Assign residents to **units** (building → block → unit)
- Upload and manage documents (ID, tenancy agreements, etc.)
- Invite resident onboarding (email/SMS/WhatsApp optional) to set password and accept terms

### 7.3 Visitor Access Control (CORE)
- Resident creates visitor invite (Guest Pass)
- System generates **QR code** (signed token)
- Guard scans QR at gate (fast validation)
- Entry and exit logs recorded
- Support multiple pass types:
  - **Single Entry** (one‑time)
  - **Service Entry** (time‑boxed; e.g., 9 AM–5 PM)
  - **Permanent** (family/long‑term)

### 7.4 Security Dashboard (Guard + Admin)
- View expected/incoming visitors
- Approve/deny access (policy‑driven + manual override with reason)
- Monitor activity in real‑time (latest events, alerts)

### 7.5 Incident Reporting
- Log incident types (theft, disputes, breach, etc.)
- Attach notes + images
- Track status (Open → Investigating → Resolved/Closed)
- Ability for guards to create fast reports (voice note optional in Phase 1 luxury spec)

### 7.6 Payments & Billing (MVP baseline)
- Record rent/service charge items (basic)
- Track payment status (Pending/Paid/Overdue)
- Notifications/reminders

> Note: full billing automation is Phase 3 “Management” module. MVP supports pilots needing lightweight tracking.

### 7.7 Notifications System
- Visitor arrival alerts to residents
- Payment reminders
- Security alerts (blacklist hits, denied attempts, panic)

Delivery channels (configurable):
- Push notifications (mobile)
- Email (admin/resident)
- WhatsApp Business API / SMS (Phase 1 luxury standard: Twilio/WhatsApp)

---

## 8. Phase 1 Security & Access Module (Luxury‑grade)

This section refines MVP into a high‑end “security OS” experience for global luxury estates.

### 8.1 Guard Persona (Handheld App)
- **3‑Second Scan**: high‑performance QR scanner validates resident‑issued invites quickly
- **ID OCR**: capture driver’s license/Emirates ID; auto‑extract name/ID number (reduce typing)
- **Digital incident reports**: photo + short voice note, instantly synced to CSO dashboard
- **Offline mode**:
  - Device caches today’s “Expected Guests” locally
  - Continues scanning/validating even during internet outage (see Offline Rules in API section)

### 8.2 Resident Persona (Mobile App)
- Guest pass generation (Single / Service / Permanent)
- Real‑time arrival notification: “Your guest, John Doe, has passed Gate X”
- Panic button: hold gesture triggers silent alarm to guard post + shares resident GPS (with clear privacy controls)

### 8.3 CSO Persona (Web Command Center)
- Live traffic overview (by gate)
- **Blacklist management**: global banned list triggers alerts on attempted entry
- Guard patrol tracking (Phase 2+): map based on NFC tag scans

### 8.4 “Luxury” product standards
| Feature | Technical specification | Luxury standard |
|---|---|---|
| ANPR integration | Webhook‑based integration with LPR cameras (Hikvision/Dahua) | Auto gate opening for residents; no stopping |
| Data privacy | AES‑256 at rest + policy‑based purge of visitor IDs after 30 days | Residents feel guest data isn’t sold/leaked |
| Communication | Twilio / WhatsApp Business API integration | Sleek branded WhatsApp invite cards |
| UI design | Dark‑mode optimized, Inter or SF Pro style system font | Gold/Slate palette; “luxury car interface” feel |

---

## 9. Future Features & Roadmap

### 9.1 Phase 2 (6–12 weeks)
- Maintenance request system
- IoT integrations (smart gates, sensors)
- CCTV integrations
- Guard patrol tracking (NFC)
- ANPR (license plate recognition) integrations

### 9.2 Phase 3 (12+ weeks)
- AI assistant (automation + support)
- Predictive analytics and smart insights dashboard
- Full management suite (levy/service charge automation)
- Artisan marketplace module

### 9.3 Cross‑module automation examples
- **Work Order → Auto Access**: assigning a plumber creates a time‑boxed access pass automatically.
- **Overdue Payments → Optional Access Policy**: after 60 days overdue, optionally revoke “auto‑gate opening” privilege (policy + legal compliance required per region).

---

## 10. Technical Requirements

### 10.1 Frontend
- Next.js (App Router)
- TailwindCSS

### 10.2 Backend
- Node.js (NestJS preferred)
- REST and/or GraphQL API (API‑first)

### 10.3 Database
- PostgreSQL with **multi‑tenant structure**

### 10.4 Infrastructure
- Cloud hosting (AWS or GCP)
- Docker (containerization)
- Observability: logs/metrics/tracing (recommended for security auditability)

---

## 11. System Architecture

### 11.1 Architecture type
- API‑first architecture
- Multi‑tenant SaaS system
- Modular services (microservices‑ready; can start as modular monolith + evolve)

### 11.2 Key components (logical services)
- **Authentication service**
- **Access control service** (invites, scans, gates, logs)
- **Resident service** (profiles, units, docs)
- **Incident service**
- **Payment service**
- **Notification service**
- **Tenant engine** (isolation, configuration, modules active)

### 11.3 Event‑driven foundation (extensibility)
Every security action is an **Event** (e.g., “InviteCreated”, “GateEntryGranted”), enabling future modules (Billing, Maintenance, AI) to subscribe without changing the core access workflow.

---

## 12. Data Model & Multi‑Tenant Strategy

### 12.1 Multi‑tenant principles
- **Tenant isolation**: each estate has isolated partitioning (schema‑per‑tenant or row‑level isolation + strict tenant_id scoping)
- **Data privacy**: design for GDPR/regional privacy requirements

### 12.2 Universal identity
- **Universal User ID (UID)**: a single login can belong to different estates and roles (e.g., Resident in Estate A, Artisan in Estate B).

### 12.3 Suggested core tables (future‑proof)
- **tenants**: estate_name, region, tier, modules_active, retention_policies
- **users**: uid, email/phone, status, biometrics_enabled
- **user_roles**: uid, tenant_id, role, permissions_profile
- **units**: tenant_id, building/block, unit_number, metadata
- **residents**: tenant_id, uid, unit_id, profile fields, documents refs
- **guest_passes**: tenant_id, pass_id, created_by_uid, resident_uid, type, schedule, status, qr_token_ref
- **access_logs**: tenant_id, timestamp, gate_id, pass_id, subject_type, subject_ref, guard_uid, decision, reason, image_ref, vehicle_plate
- **incidents**: tenant_id, incident_id, created_by_uid, type, severity, status, attachments
- **blacklist**: tenant_id (or global), subject identifiers, reason, active, expires_at
- **events**: tenant_id, event_id, event_type, payload, created_at, actor_uid, correlation_id

---

## 13. Security Requirements

### 13.1 Data security
- Encrypted data storage (at rest)
- TLS in transit
- Secure storage for secrets (cloud secret manager)

### 13.2 API security
- Secure API endpoints with authentication + authorization
- Rate limiting (especially on scan and auth endpoints)
- Input validation + strict tenant scoping

### 13.3 Auditability
- Audit logs for all actions (who/what/when/where)
- Immutable event log patterns (append‑only where feasible)

### 13.4 Auth model requirements
- Secure authentication (JWT or session‑based)
- Token revocation/rotation strategy
- Optional MFA (feature flag)

### 13.5 Privacy & retention
- Auto‑purge visitor IDs after configured period (default 30 days for luxury standard; configurable per tenant/region)
- Clear privacy controls for panic button GPS sharing and logs access

---

## 14. UX Requirements

### 14.1 Design principles
- Clean, modern UI with a luxury feel
- Mobile‑first approach
- Role‑based dashboards (Resident vs Guard vs Admin vs CSO)

### 14.2 Key UX goals
- **Fast interaction** for guards (scan → decision → log)
- **Clear navigation** for admins (manage residents, reports, settings)
- **Simple flows** for residents (create pass in seconds, trust‑building confirmations)

---

## 15. Key User Flows

### 15.1 Visitor Entry Flow
1. Resident creates visitor invite
2. QR code generated
3. Visitor arrives at gate
4. Guard scans QR
5. Access granted/denied
6. Log recorded (entry and optionally exit)

### 15.2 Resident Onboarding
1. Admin creates resident profile and assigns unit
2. Resident receives invite link
3. Resident sets password and accepts terms
4. Access granted based on role permissions

### 15.3 Incident Reporting Flow
1. Guard logs incident (notes/photos/voice)
2. Admin/CSO reviews
3. Action taken
4. Status updated and audit logged

---

## 16. Analytics & Reporting

### 16.1 Reports
- Visitor logs (by gate, by resident, by date range)
- Incident reports (by type/severity/status)
- Payment reports (if module enabled)
- Resident activity (invites created, alerts, onboarding status)

### 16.2 Operational analytics
- Gate throughput (scans/min, avg decision time)
- Deny rates and top deny reasons
- Blacklist hit rate

---

## 17. Business Model

### 17.1 Pricing strategy
- Subscription per estate
- Pricing per unit (tiered)

### 17.2 Add‑ons
- AI features
- Advanced security tools
- IoT integrations

---

## 18. Testing Strategy

- Unit testing (core services)
- Integration testing (end‑to‑end flows like invite → scan → log)
- User testing with real estate pilots (guards + residents + admins)

---

## 19. Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Low adoption | UX simplicity; guard workflows optimized; pilot rollout + training |
| Security breaches | strong encryption, strict RBAC, audits, rate limiting, monitoring |
| Complexity creep | start with focused MVP; modular core; feature flags |
| Offline/internet instability | offline caching; resilient sync; clear offline rules |
| Regional privacy/legal issues | tenant‑configurable retention; access policies; legal review per region |

---

## 20. Timeline

### Phase 1 (0–6 weeks)
- MVP design + development (Security module foundation)

### Phase 2 (6–12 weeks)
- Smart features + improvements (IoT/CCTV/ANPR, maintenance requests)

### Phase 3 (12+ weeks)
- AI + scaling + management suite + marketplace

---

## 21. API Documentation Starter: Guest Invitation “Heartbeat”

This is a starter API spec for the end‑to‑end **Guest Invitation** flow (create pass → distribute QR → guard scan → decision → logs → notifications). It is designed to be **multi‑tenant**, **auditable**, and **integration‑ready**.

### 21.1 API principles
- **Tenant‑scoped**: every request is scoped to a tenant (estate) via `X-Tenant-Id` header or subdomain mapping.
- **Evented**: every important action emits an event (append‑only).
- **Least privilege**: role permissions enforced on every endpoint.
- **Idempotent**: create endpoints accept idempotency keys to prevent duplicates.

### 21.2 Auth & request context

**Headers**
- `Authorization: Bearer <token>`
- `X-Tenant-Id: <tenant_id>` (or `tenant` derived from subdomain)
- `Idempotency-Key: <uuid>` (recommended for creates)

**Role access**
- Resident: create/view own guest passes
- Guard: scan/validate passes, create logs, create incidents
- Admin/CSO: view all passes/logs, manage policy, blacklist, exports

### 21.3 Core entities (API view)

#### 21.3.1 GuestPass
- `passId` (uuid)
- `tenantId`
- `createdByUid`
- `residentUid`
- `type`: `single_entry` | `service_timeboxed` | `permanent`
- `visitor`: (see VisitorIdentity)
- `schedule`:
  - `validFrom`, `validTo` (required for timeboxed)
  - `daysOfWeek` (optional)
- `allowedGates`: string[] (optional; empty means any)
- `maxEntries`: number (default 1 for single, configurable)
- `status`: `active` | `used` | `expired` | `revoked`
- `qrPayloadVersion`: number
- `createdAt`, `updatedAt`

#### 21.3.2 VisitorIdentity
Minimal for MVP; can expand with OCR capture.
- `fullName` (optional for MVP)
- `phone` (optional)
- `idType`: `drivers_license` | `national_id` | `passport` | `emirates_id` (optional)
- `idNumber` (optional; may be captured at gate)
- `vehiclePlate` (optional; supports ANPR later)

#### 21.3.3 ScanDecision
- `decision`: `granted` | `denied` | `manual_review`
- `reasonCode` (required when denied): `expired` | `revoked` | `already_used` | `outside_schedule` | `not_allowed_gate` | `blacklist_hit` | `invalid_signature` | `offline_unverifiable` | `other`
- `reasonNote` (optional)

#### 21.3.4 AccessLog
- `logId` (uuid)
- `tenantId`
- `timestamp`
- `gateId`
- `direction`: `entry` | `exit`
- `passId`
- `residentUid`
- `guardUid`
- `decision`
- `reasonCode`/`reasonNote`
- `evidence`:
  - `idCaptureRef` (optional)
  - `imageRef` (optional)
  - `voiceNoteRef` (optional)

### 21.4 QR token format (high level)

**Goal**: QR must be quickly verifiable and tamper‑proof.

Recommended approach:
- Signed token (e.g., JWS) containing:
  - `tenantId`, `passId`, `v` (version), `iat`, `exp`
  - Optional: `allowedGates` hash, `type`, `maxEntries`
- Guard app validates signature using a cached public key set (supports offline).

### 21.5 Endpoints (v1)

Base path example: `/api/v1`

#### 21.5.1 Create Guest Pass (Resident)
`POST /guest-passes`

**Auth**: Resident  
**Idempotent**: yes (`Idempotency-Key`)  

Request body (example shape):
- `type`
- `visitor` (minimal)
- `schedule` (required for timeboxed/service)
- `allowedGates` (optional)
- `maxEntries` (optional)

Response:
- GuestPass object
- `qrCodeUrl` (or `qrSvg`/`qrPng` depending on frontend needs)
- Emits event: `GuestPassCreated`

#### 21.5.2 List Guest Passes (Resident/Admin)
`GET /guest-passes?status=active&type=single_entry&from=...&to=...`

**Auth**: Resident sees own; Admin/CSO sees all  
Emits event optionally: `GuestPassViewed` (audit)

#### 21.5.3 Revoke Guest Pass (Resident/Admin)
`POST /guest-passes/{passId}/revoke`

**Auth**: Resident can revoke own; Admin/CSO can revoke any  
Response: updated GuestPass  
Emits event: `GuestPassRevoked`

#### 21.5.4 Guard Scan / Validate QR (Guard)
`POST /gate-scans`

**Auth**: Guard  

Request body:
- `gateId`
- `qrToken`
- `deviceId`
- `capturedVisitor` (optional OCR results)
- `direction`: `entry` | `exit`

Behavior:
- Validate signature + tenant
- Check pass status, schedule window, gate allowlist, maxEntries remaining
- Check blacklist rules (tenant/global)
- Return decision + log reference

Response:
- `decision` + `reasonCode`
- `pass` summary (safe subset)
- `logId`
- Emits events:
  - `GateScanReceived`
  - `GateAccessGranted` or `GateAccessDenied`
  - `AccessLogCreated`

#### 21.5.5 Access Logs (Admin/CSO/Guard)
`GET /access-logs?gateId=...&from=...&to=...&decision=...`

**Auth**: Guard (limited), Admin/CSO (full)  
Exports can be added: `GET /access-logs/export.csv`

#### 21.5.6 Blacklist Management (Admin/CSO)
`POST /blacklist`
`GET /blacklist`
`POST /blacklist/{id}/disable`

Emits events: `BlacklistEntryCreated`, `BlacklistEntryDisabled`

### 21.6 Offline mode rules (Guard app)

Offline mode must keep the gate moving while maintaining security:
- Device caches “Expected Guests” (active passes for today + near future window) per gate.
- QR signature validation can work offline using cached keys.

**When offline**
- If QR validates and pass exists in cache and is within rules → allow **granted** with `reasonCode = offline_cached_ok` (log locally, sync later).
- If QR validates but pass not in cache → return `manual_review` or `denied` depending on estate policy (`offline_unverifiable`).
- All offline actions must be **audited** and synced with conflict handling (idempotent log upload).

### 21.7 Notifications for the flow

When a pass is:
- **Created**: notify resident (confirmation)
- **Used for entry**: push “Your guest has arrived/passed Gate X”
- **Denied**: alert resident (optional) + CSO if critical reason (blacklist hit)
- **Revoked**: notify resident and optionally guards (if pass was expected today)

### 21.8 Error handling (API standard)
- Use consistent error shapes: `code`, `message`, `details`, `correlationId`
- Common error codes:
  - `TENANT_REQUIRED`
  - `UNAUTHORIZED`
  - `FORBIDDEN`
  - `PASS_EXPIRED`
  - `PASS_REVOKED`
  - `PASS_USED_UP`
  - `OUTSIDE_SCHEDULE`
  - `BLACKLIST_HIT`
  - `INVALID_QR_SIGNATURE`
  - `RATE_LIMITED`

### 21.9 Audit & observability requirements for the flow
- Every endpoint writes an audit record (actor, tenant, action, resource, timestamp, ip/device).
- Every scan produces a correlation id to link:
  - scan request → decision → access log → notifications → incident (if any)
- Alerting:
  - unusually high deny rate
  - repeated invalid signature attempts (possible forgery)
  - blacklist hit escalation

### 21.10 Open questions to finalize before implementation
(Documented here to ensure “covers everything”, even if the initial MVP picks defaults.)
- Tenant isolation choice: schema‑per‑tenant vs row‑level with strict policies
- Token model: session vs JWT; revocation mechanism; device trust model for guard devices
- Retention defaults per region: 30 days visitor data purge vs tenant configured
- Gate policies: offline handling (manual_review vs deny)
- Pass usage model: entry/exit pairing rules and maxEntries semantics
- WhatsApp integration: template approvals per region, branding requirements

