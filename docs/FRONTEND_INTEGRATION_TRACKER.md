# Frontend Integration — Progress Tracker

**Last updated:** 2026-07-07  
**Current phase:** F7 — Customer self-service booking ✅ (F7e tests/docs in progress)  
**Design doc:** [FRONTEND_INTEGRATION_PLAN.md](./FRONTEND_INTEGRATION_PLAN.md)  
**Backend status:** [IMPLEMENTATION_PLAN.md](../../simple-appointment-scheduler-be/docs/IMPLEMENTATION_PLAN.md) (Phases 1–4 complete)

Use this document to track frontend integration work. Update checkboxes and the phase summary when tasks land.

### Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done |
| 🔶 | Partial — started but not fully meeting the phase goal |
| ⬜ | Not started |
| ↪ | Deferred or out of scope (note explains) |

---

## Progress overview

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| F1 | Foundation | ✅ Done | Config, types, BFF client, auth store, middleware, auth proxy |
| F2 | Login | ✅ Done | Login page, default layout, auth bootstrap, admin landing |
| F3 | Admin shell | ✅ Done | Layout, nav, reusable components, `useAdminApi`, 22 BFF routes |
| F4a | Skills & Dealerships | ✅ Done | CRUD pages wired to live API |
| F4b | Nested dealership resources | ✅ Done | Service types, bays, technicians |
| F4c | Customers & Vehicles | ✅ Done | Staff-accessible customer management |
| F5 | Error handling & UX | ✅ Done | ProblemDetails mapping, 401/403 flows, validators, skeletons |
| F6 | Tests & docs | ✅ Done | Unit tests, ARCHITECTURE.md / STORES.md updates |
| F7 | Customer self-service booking | ✅ Done | Auth + BFF + booking flow on .NET; mocks retired |
| F8 | Appointment admin | 🔶 Partial | Daily schedule + lifecycle actions on admin grid |

---

## Phase F1 — Foundation ✅

| Task | Status | Evidence |
|------|--------|----------|
| Add `runtimeConfig.apiBaseUrl` to `nuxt.config.ts` | ✅ | `nuxt.config.ts` |
| Add `.env.example` with `NUXT_API_BASE_URL` | ✅ | `.env.example` |
| Create `app/types/api.ts` (auth + entity DTOs) | ✅ | `app/types/api/` |
| Create `server/utils/backendClient.ts` | ✅ | `server/utils/backendClient.ts` |
| Create `app/stores/authStore.ts` | ✅ | `app/stores/authStore.ts` |
| Create `app/composables/useAuth.ts` | ✅ | `app/composables/useAuth.ts` |
| Create `app/middleware/auth.ts` | ✅ | `app/middleware/auth.ts` |
| Create `app/middleware/admin.ts` | ✅ | `app/middleware/admin.ts` |
| Create `server/api/auth/login.post.ts` | ✅ | `server/api/auth/login.post.ts` |
| Create `server/api/auth/me.get.ts` | ✅ | `server/api/auth/me.get.ts` |
| Update `docker-compose.yml` frontend `NUXT_API_BASE_URL` | ✅ | `docker-compose.yml` |

---

## Phase F2 — Login ✅

| Task | Status | Evidence |
|------|--------|----------|
| Create `app/layouts/default.vue` | ✅ | `app/layouts/default.vue` |
| Update `app.vue` with `<NuxtLayout>` | ✅ | `app/app.vue` |
| Create `app/pages/login.vue` | ✅ | `app/pages/login.vue` |
| Create `plugins/auth.client.ts` (token bootstrap) | ✅ | `app/plugins/auth.client.ts` |
| `app/pages/admin/index.vue` (post-login redirect target) | ✅ | `app/pages/admin/index.vue` |
| `test/stores/authStore.spec.ts` | ✅ | `test/stores/authStore.spec.ts` |
| `test/pages/login.spec.ts` | ✅ | `test/pages/login.spec.ts` |

**Exit criteria:** Admin user can log in against live .NET backend and land on `/admin`.

---

## Phase F3 — Admin shell ✅

| Task | Status | Evidence |
|------|--------|----------|
| Create `app/layouts/admin.vue` (sidebar, logout) | ✅ | `app/layouts/admin.vue` |
| Create `app/pages/admin/index.vue` (dashboard) | ✅ | `app/pages/admin/index.vue` |
| Permission-gated nav (dealerships, skills, customers) | ✅ | `app/layouts/admin.vue` |
| `app/components/admin/AdminDataTable.vue` | ✅ | `app/components/admin/AdminDataTable.vue` |
| `app/components/admin/EntityFormDialog.vue` | ✅ | `app/components/admin/EntityFormDialog.vue` |
| `app/components/admin/ConfirmDeleteDialog.vue` | ✅ | `app/components/admin/ConfirmDeleteDialog.vue` |
| `app/components/admin/TimeRangePicker.vue` | ✅ | `app/components/admin/TimeRangePicker.vue` |
| Create `app/composables/useAdminApi.ts` | ✅ | `app/composables/useAdminApi.ts` |
| `server/utils/authenticatedBackendFetch.ts` | ✅ | `server/utils/authenticatedBackendFetch.ts` |
| `server/api/admin/**` proxy routes (22 files) | ✅ | `server/api/admin/` |
| Register `authStore` in `STORES.md` | ✅ | `STORES.md` |

---

## Phase F4 — Entity CRUD ✅

Build in dependency order (mirrors backend Phase 3).

| # | Feature | Page | Proxy routes | Status |
|---|---------|------|--------------|--------|
| 1 | **Skill** | `admin/skills/index.vue` | `GET/POST /api/admin/skills`, `DELETE [id]` | ✅ |
| 2 | **Dealership** | `admin/dealerships/index.vue` | `GET/POST/PUT /api/admin/dealerships` | ✅ |
| 3 | **ServiceType** | `admin/dealerships/[id]/service-types.vue` | nested under dealership | ✅ |
| 4 | **ServiceBay** | `admin/dealerships/[id]/service-bays.vue` | nested under dealership | ✅ |
| 5 | **Technician** | `admin/dealerships/[id]/technicians.vue` | nested; `skillIds` on create/update | ✅ |
| 6 | **Customer** | `admin/customers/index.vue` | `GET/POST/PUT /api/admin/customers` | ✅ |
| 7 | **Vehicle** | `admin/customers/[id]/vehicles.vue` | nested under customer | ✅ |

**Per-feature checklist:**

- [x] Nitro proxy route(s)
- [x] `useAdminApi` method(s)
- [x] List table with loading/empty states
- [x] Create dialog
- [x] Edit dialog (where backend supports it)
- [x] Delete (where backend supports it)
- [ ] Manual smoke test against live backend (run locally with `dotnet run` + `npm run dev`)

---

## Phase F5 — Error handling & UX ✅

| Task | Status | Evidence |
|------|--------|----------|
| Map `ProblemDetails` to user-facing messages | ✅ | `app/utils/apiErrors.ts` |
| Global 401 handler → logout + redirect | ✅ | `useAdminApi.ts`, `authStore.ts` |
| 403 permission denied UI | ✅ | `/forbidden`, admin middleware, snackbar |
| Form validation (required, email, year) | ✅ | `app/utils/validators.ts` |
| Loading skeletons; disable submit while saving | ✅ | `AdminDataTable.vue`, `EntityFormDialog.vue` |

---

## Phase F6 — Tests & docs ✅

| Task | Status | Evidence |
|------|--------|----------|
| `useAdminApi` / proxy route tests | ✅ | `test/composables/useAdminApi.spec.ts`, `test/server/authenticatedBackendFetch.spec.ts` |
| Middleware tests | ✅ | `test/middleware/middleware.spec.ts` |
| `apiErrors` / `validators` tests | ✅ | `test/utils/apiErrors.spec.ts`, `test/utils/validators.spec.ts` |
| Update `ARCHITECTURE.md` (auth + admin sections) | ✅ | `ARCHITECTURE.md` |
| Fix `STORES.md` registry | ✅ | `STORES.md` |
| Cross-link in backend `IMPLEMENTATION_PLAN.md` | ✅ | backend `docs/IMPLEMENTATION_PLAN.md` |

---

## Phase F7 — Customer self-service booking ✅

Sub-phases F7a–F7d landed the backend identity/self-service APIs, auth BFF, and booking migration. F7e added targeted tests and removed the redundant catalog endpoint.

| Sub-phase | Scope | Status | Evidence |
|-----------|-------|--------|----------|
| F7a | User↔Customer link, register creates Customer | ✅ | `AuthService`, `GET /api/auth/me` |
| F7b | `/api/me/*`, ownership checks, `servicetypes:read:customer` | ✅ | `MeController`, `AppointmentService` |
| F7c | Auth BFF, register page, `authStore.register()` | ✅ | `server/api/auth/register.post.ts`, `app/pages/register.vue` |
| F7d | Booking flow on real API, mock retirement | ✅ | `useBookingApi`, `bookingStore`, `server/api/booking/*` |
| F7e | Tests + docs + catalog cleanup | ✅ | `test/composables/useBookingApi.spec.ts`, `test/stores/bookingStore.spec.ts` |

| Task | Status | Evidence |
|------|--------|----------|
| BFF `GET /api/booking/availability` → .NET | ✅ | `server/api/booking/availability.get.ts` |
| BFF `POST /api/booking/appointments` → .NET | ✅ | `server/api/booking/appointments.post.ts` |
| BFF `GET /api/booking/service-types` (dealership + service types) | ✅ | `server/api/booking/service-types.get.ts` |
| BFF `/api/me/*` routes | ✅ | `server/api/me/**` |
| `useBookingApi` composable | ✅ | `app/composables/useBookingApi.ts` |
| `bookingStore` on GUID types + seconds-from-midnight | ✅ | `app/stores/bookingStore.ts` |
| `auth` middleware on booking pages | ✅ | `app/pages/booking-start.vue`, etc. |
| Retire Nitro mock routes | ✅ | Removed `server/api/services.get.ts`, etc. |
| Remove backend `/api/booking/catalog` | ✅ | Replaced by `GET /api/booking/dealership` |
| `useBookingApi` / `bookingStore` unit tests | ✅ | `test/composables/useBookingApi.spec.ts`, `test/stores/bookingStore.spec.ts` |
| Customer My Appointments page | ✅ | `app/pages/my-appointments.vue`, `GET /api/me/appointments` via `fetchMyAppointments` |
| Manual E2E smoke test | ⬜ | Register → book → summary against live stack |

**Exit criteria:** Customer registers, books against .NET via BFF, and sees confirmation. Admin flow unchanged.

---

## Deferred phases

| Task | Status | Notes |
|------|--------|-------|
| Daily schedule view | ✅ | `GET /api/dealerships/{id}/appointments?date=` — `admin/dealerships/[id]/appointments.vue` |
| Status transitions UI | ✅ | Start/Complete actions on admin appointments grid |
| Cancel appointment UI | ✅ | Cancel dialog + `POST /api/admin/appointments/{id}/cancel` BFF |
| Customer self-service cancel | ↪ | Optional — `/api/me/appointments` cancel button |

---

## Recommended next session

1. Manual smoke test: customer books → summary → My appointments list shows enriched labels.
2. Optional: customer self-service cancel on `/api/me/appointments`.
3. Manual smoke test: admin starts/completes/cancels appointment on daily schedule grid.

---

## Related docs

- [FRONTEND_INTEGRATION_PLAN.md](./FRONTEND_INTEGRATION_PLAN.md) — architecture and design decisions
- [ARCHITECTURE.md](../ARCHITECTURE.md) — booking flow + admin integration
- [STORES.md](../STORES.md) — Pinia store registry
- [AGENTS.md](../AGENTS.md) — frontend conventions
- [Backend IMPLEMENTATION_PLAN.md](../../simple-appointment-scheduler-be/docs/IMPLEMENTATION_PLAN.md) — API availability by phase
