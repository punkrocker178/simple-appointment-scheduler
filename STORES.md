# Pinia Stores Documentation

This document provides a registry and reference for all Pinia stores in the universal-scheduler project.

## Active Stores

### `authStore` — `app/stores/authStore.ts`

Manages JWT session metadata for admin/staff users. The JWT itself is stored in an httpOnly cookie set by the Nitro BFF; this store holds `email`, `role`, `permissions`, and `expiresAt` synced from `/api/auth/me`.

| State | Type | Purpose |
|-------|------|---------|
| `expiresAt` | `string` | Token expiry (ISO) |
| `email` | `string` | Signed-in user email |
| `role` | `string` | Role name (Admin, Staff, …) |
| `permissions` | `string[]` | Permission claims from `/api/auth/me` |
| `isLoading` | `boolean` | Async auth operation in progress |
| `error` | `string \| null` | Last auth error message |

| Getter | Purpose |
|--------|---------|
| `isAuthenticated` | `true` when `expiresAt` is in the future |

| Action | Purpose |
|--------|---------|
| `login(email, password)` | `POST /api/auth/login`, then `fetchMe()` |
| `fetchMe()` | `GET /api/auth/me` — clears session on 401 |
| `logout()` | `POST /api/auth/logout` + clear local state |
| `hasPermission(name)` | Check if permission is in `permissions` |
| `clearSession()` | Reset local state without API call |

**Usage:** `const authStore = useAuthStore()` or `useAuth()` composable wrapper.

---

### `bookingStore` — `app/stores/bookingStore.ts`

Central state for the customer booking flow (Nitro mocks). See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full booking workflow.

| State | Type | Purpose |
|-------|------|---------|
| `services` | `Service[]` | Available services catalog |
| `selectedServiceId` | `number \| null` | Selected service |
| `selectedDate` | `string` | Booking date (YYYY-MM-DD) |
| `availableSlots` | `Slot[]` | Slots for selected date/service |
| `selectedSlot` | `Slot \| null` | Chosen time slot |
| `vehicle` | `{ plate, make?, model? }` | Vehicle info |
| `customer` | `{ name, email }` | Customer contact |
| `appointmentId` | `string \| null` | Created appointment ID |
| `bookingReference` | `string \| null` | Confirmation reference |
| `confirmation` | `Appointment \| null` | Full appointment after booking |
| `isLoading` | `boolean` | API in progress |
| `error` | `string \| null` | Last error |

| Getter | Purpose |
|--------|---------|
| `selectedService` | Full `Service` for `selectedServiceId` |
| `isBookingComplete` | All required booking fields filled |

| Action | Purpose |
|--------|---------|
| `loadServices()` | Fetch service catalog |
| `selectService(id)` | Set service; reset date/slots |
| `selectDate(date)` | Set date; clear slot |
| `fetchAvailability(date)` | Load slots |
| `selectSlot(slot)` | Select time slot |
| `setVehicle(...)` / `setCustomer(...)` | Update contact info |
| `submitBooking()` | Create appointment |
| `resetBooking()` | Clear all state |

---

## Guidelines for Store Creation

1. **Location:** `app/stores/`
2. **Naming:** `camelCase.ts` matching store ID (e.g. `authStore.ts` → `defineStore('authStore', …)`)
3. **JSDoc:** Document state, getters, and actions in the file header
4. **Composition API:** Use `defineStore` with setup syntax (not Options API)
5. **Registry:** Add new stores to this file when created

---

**Last updated:** July 6, 2026
