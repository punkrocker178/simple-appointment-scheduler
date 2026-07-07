# Pinia Stores Documentation

This document provides a registry and reference for all Pinia stores in the universal-scheduler project.

## Active Stores

### `authStore` — `app/stores/authStore.ts`

Manages JWT session metadata for admin/staff and customer users. The JWT itself is stored in an httpOnly cookie set by the Nitro BFF; this store holds `email`, `role`, `customerId`, `permissions`, and `expiresAt` synced from `/api/auth/me`.

| State | Type | Purpose |
|-------|------|---------|
| `expiresAt` | `string` | Token expiry (ISO) |
| `email` | `string` | Signed-in user email |
| `role` | `string` | Role name (Admin, Staff, User, …) |
| `customerId` | `string \| null` | Linked customer profile for User role |
| `permissions` | `string[]` | Permission claims from `/api/auth/me` |
| `isLoading` | `boolean` | Async auth operation in progress |
| `error` | `string \| null` | Last auth error message |

| Getter | Purpose |
|--------|---------|
| `isAuthenticated` | `true` when `expiresAt` is in the future |

| Action | Purpose |
|--------|---------|
| `login(email, password)` | `POST /api/auth/login`, then `fetchMe()` |
| `register(request)` | `POST /api/auth/register` (auto-login), then `fetchMe()` |
| `fetchMe()` | `GET /api/auth/me` — clears session on 401 |
| `logout()` | `POST /api/auth/logout` + clear local state |
| `hasPermission(name)` | Check if permission is in `permissions` |
| `clearSession()` | Reset local state without API call |

**Usage:** `const authStore = useAuthStore()` or `useAuth()` composable wrapper.

---

### `bookingStore` — `app/stores/bookingStore.ts`

Central state for the authenticated customer booking flow backed by the real .NET API. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full booking workflow.

| State | Type | Purpose |
|-------|------|---------|
| `services` | `ServiceTypeOption[]` | Active service types from `/api/booking/service-types` |
| `dealershipId` | `string \| null` | Default dealership resolved by the BFF |
| `selectedServiceTypeId` | `string \| null` | Selected service type GUID |
| `selectedDate` | `string` | Booking date (YYYY-MM-DD) |
| `availabilityResponse` | `AvailabilityResponse \| null` | Full backend availability response |
| `availableSlots` | `AvailabilitySlotDto[]` | Slots for selected date/service |
| `selectedSlot` | `AvailabilitySlotDto \| null` | Chosen time slot (`secondsFromMidnight`) |
| `vehicles` | `BookingVehicle[]` | Customer's saved vehicles from `/api/me/vehicles` |
| `selectedVehicleId` | `string \| null` | Selected vehicle GUID |
| `customerProfile` | `Customer \| null` | Customer profile from `/api/me/customer` |
| `appointment` | `AppointmentResponse \| null` | Created appointment from backend |
| `isLoading` | `boolean` | API in progress |
| `error` | `string \| null` | Last error |

| Getter | Purpose |
|--------|---------|
| `selectedService` | Full `ServiceTypeOption` for `selectedServiceTypeId` |
| `selectedVehicle` | Full `BookingVehicle` for `selectedVehicleId` |
| `isBookingComplete` | All required booking fields filled |

| Action | Purpose |
|--------|---------|
| `bootstrap()` | Load service types, vehicles, and customer profile |
| `selectServiceType(id)` | Set service type; reset date/slots |
| `selectDate(date)` | Set date; clear slot |
| `fetchAvailability(date)` | Load slots from `/api/booking/availability` |
| `selectSlot(slot)` | Select time slot |
| `selectVehicle(id)` | Select an existing saved vehicle |
| `addVehicle(make, model, year)` | Create and select a new vehicle via `/api/me/vehicles` |
| `submitBooking()` | Create appointment with `customerId`, `vehicleId`, `serviceTypeId`, `bookingDate`, `secondsFromMidnight` |
| `resetBooking()` | Clear all state |

---

## Guidelines for Store Creation

1. **Location:** `app/stores/`
2. **Naming:** `camelCase.ts` matching store ID (e.g. `authStore.ts` → `defineStore('authStore', …)`)
3. **JSDoc:** Document state, getters, and actions in the file header
4. **Composition API:** Use `defineStore` with setup syntax (not Options API)
5. **Registry:** Add new stores to this file when created

---

**Last updated:** July 7, 2026
