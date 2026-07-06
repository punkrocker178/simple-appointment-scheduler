# Frontend Integration — Progress Tracker

**Last updated:** 2026-07-06  
**Current phase:** F5 — Error handling & UX (next)  
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
| F5 | Error handling & UX | ⬜ Not started | ProblemDetails mapping, 401/403 flows |
| F6 | Tests & docs | ⬜ Not started | Unit tests, ARCHITECTURE.md / STORES.md updates |
| F7 | Booking flow migration | ↪ Deferred | Replace Nitro mocks with .NET BFF proxies |
| F8 | Appointment admin | ↪ Deferred | Blocked on backend Phase 5 lifecycle APIs |

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
| Register `authStore` in `STORES.md` | ⬜ | Deferred to F6 |

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

## Phase F5 — Error handling & UX ⬜

| Task | Status |
|------|--------|
| Map `ProblemDetails` to user-facing messages | 🔶 Partial — per-page alerts + `useAdminApi` |
| Global 401 handler → logout + redirect | 🔶 Partial — `useAdminApi` clears session on 401 |
| 403 permission denied UI | ⬜ |
| Form validation (required, email, year) | 🔶 Partial — inline on CRUD forms |
| Loading/disabled states on save | ✅ |

---

## Phase F6 — Tests & docs ⬜

| Task | Status | Evidence |
|------|--------|----------|
| `useAdminApi` / proxy route tests | ⬜ | — |
| Admin component tests | ⬜ | — |
| Middleware tests | ⬜ | — |
| Update `ARCHITECTURE.md` (auth + admin sections) | ⬜ | — |
| Fix `STORES.md` registry | ⬜ | — |
| Cross-link in backend `IMPLEMENTATION_PLAN.md` | ⬜ | — |

---

## Deferred phases

### F7 — Booking flow migration ↪

| Task | Status | Notes |
|------|--------|-------|
| Proxy `GET /api/availability` to .NET | ↪ | Remap query params (`dealershipId`, `serviceTypeId`, `date`) |
| Proxy `POST /api/appointments` to .NET | ↪ | Guid-based payload; customer/vehicle creation flow TBD |
| Replace `fetchServices` with dealership service types | ↪ | Booking UX may need dealership selector |
| Update `bookingStore` types | ↪ | `number` → `string` GUIDs |
| Retire or gate mock `server/api/*` routes | ↪ | — |

### F8 — Appointment admin ↪

| Task | Status | Notes |
|------|--------|-------|
| Daily schedule view | ↪ | `GET /api/dealerships/{id}/appointments?date=` |
| Status transitions UI | ↪ | Blocked on backend Phase 5 |
| Cancel appointment UI | ↪ | Blocked on backend Phase 5 |

---

## Recommended next session

1. **F5** — Global 403 handling, polish ProblemDetails mapping.
2. **F6** — Admin layer tests, `STORES.md` / `ARCHITECTURE.md` updates.
3. Manual smoke test: login as admin → full CRUD round-trip on skills/dealerships/customers.

---

## Related docs

- [FRONTEND_INTEGRATION_PLAN.md](./FRONTEND_INTEGRATION_PLAN.md) — architecture and design decisions
- [ARCHITECTURE.md](../ARCHITECTURE.md) — booking flow (to be extended)
- [STORES.md](../STORES.md) — Pinia store registry
- [AGENTS.md](../AGENTS.md) — frontend conventions
- [Backend IMPLEMENTATION_PLAN.md](../../simple-appointment-scheduler-be/docs/IMPLEMENTATION_PLAN.md) — API availability by phase
