# AGENTS.md

## 1. Project Overview

The universal scheduler is a Nuxt 4 application that provides digital appointment booking between customers and dealership. The Frontend application guides the user through selecting a vehicle, service type, and desired date, then presents only valid appointment slots based on Backend availability checks.

**Tech Stack:**
- Nuxt 4 with Vue 3 (Composition API)
- TypeScript (strict mode)
- Pinia for state management
- Tailwind CSS for styling
- Vuetify for UI components
- Vitest for unit testing
- ESLint + Prettier for code quality

## 2. Build & Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Starts the dev server on `http://localhost:3000` with hot module replacement.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Generate Static Pages
```bash
npm run generate
```

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
# Auto-format with Prettier (handles indentation, quotes, semicolons)
npx prettier --write .

# ESLint with auto-fix for linting errors
npx eslint --fix .
```

Both ESLint (code quality) and Prettier (code formatting) are configured and should run before committing code.

## 3. Code Style & Conventions

**Language / Runtime:**
- TypeScript with Nuxt 4 strict mode
- Node.js (ESM modules via `"type": "module"`)
- Vue 3 Composition API (not Options API)

**Linter:**
- ESLint with `@nuxt/eslint` for Nuxt-specific rules
- Config: `eslint.config.mjs` (flat config format)
- Prettier for consistent code formatting
- Run linting with: `npm run lint` or `npx eslint .`
- Auto-fix with: `npx eslint --fix . && npx prettier --write .`

**TypeScript & Vue 3 Composition API:**
- All components and composables must use `<script setup lang="ts">` or Composition API with TypeScript
- Use `ref<Type>()` for reactive values with explicit type annotations
- Use `computed()` for derived/computed state
- Use `watch()` or `watchEffect()` for side effects
- Avoid mixing Options API and Composition API in the same file
- Always provide return type annotations for functions

**Example Component Structure:**
```typescript
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppointmentStore } from '#app';

interface Props {
  title: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  select: [id: string];
}>();

const appointmentStore = useAppointmentStore();
const isOpen = ref<boolean>(false);
const selectedId = computed<string | null>(
  () => appointmentStore.selectedAppointmentId
);

const handleSelect = (id: string): void => {
  emit('select', id);
};
</script>
```

## 4. Architecture & Best Practices

### Composables & VueUse Integration

Composables are reusable Vue 3 Composition API functions that encapsulate logic. Extract logic into a composable when it's:
- Used in 2 or more components
- Complex enough to benefit from separation
- Related to a specific feature or concern

**Location:** `app/composables/`

**Example Composable:**
```typescript
// app/composables/useAppointmentForm.ts
import { ref, computed } from 'vue';
import type { Appointment } from '@/types';

export function useAppointmentForm() {
  const form = ref<Partial<Appointment>>({
    vehicleId: '',
    serviceType: '',
    date: '',
  });

  const isValid = computed(() => {
    return form.value.vehicleId && form.value.serviceType && form.value.date;
  });

  const reset = (): void => {
    form.value = { vehicleId: '', serviceType: '', date: '' };
  };

  return { form, isValid, reset };
}
```

**@vueuse/nuxt Smart Use:**

`@vueuse/nuxt` is pre-installed and provides composables for common patterns. Use these when applicable:
- `useStorage()` - Persistent state in localStorage/sessionStorage
- `useFetch()` - HTTP requests with automatic error handling
- `useState()` - Nuxt SSR-safe shared state (use this instead of `ref()` for cross-component state)
- `useAsyncState()` - Async state with loading/error states
- `useDebounce()` / `useThrottle()` - Debounce/throttle frequently-fired functions

**Example with @vueuse/nuxt:**
```typescript
import { useState, useFetch } from '#app';

// SSR-safe shared state
const appointmentDate = useState<string>('appointmentDate', () => '');

// Fetch with automatic loading/error handling
const { data: appointments, pending: isLoading, error } = await useFetch(
  '/api/appointments'
);
```

### Pinia State Management

Use Pinia for shared state that needs to be accessed across multiple components or persisted. See [STORES.md](./STORES.md) for the complete store registry and guidelines.

**When to use Pinia:**
- State needed by 2+ components at different nesting levels
- State that persists across route changes
- State with complex mutations (multiple getters/actions)

**When NOT to use Pinia:**
- Local component state (use `ref()` / `computed()` instead)
- Temporary UI state like form inputs in a single component
- Props that can be passed down naturally

**Store File Naming:** `app/stores/storeNameStore.ts`

**Example Store (Composition API):**
```typescript
// app/stores/appointmentStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Appointment } from '@/server/utils/types';

/**
 * Appointment Store - Manages appointment booking state
 * 
 * **State:**
 * - appointments: List of fetched appointments
 * - selectedAppointmentId: Currently selected appointment ID
 * - isLoading: API request loading state
 * 
 * **Getters:**
 * - selectedAppointment: Returns full appointment object for selectedAppointmentId
 * - availableAppointments: Returns only available (not booked) appointments
 * 
 * **Actions:**
 * - fetchAppointments(filters): Fetch appointments from API
 * - selectAppointment(id): Set selectedAppointmentId
 * - bookAppointment(): Submit booking for selected appointment
 */
export const useAppointmentStore = defineStore('appointmentStore', () => {
  // State
  const appointments = ref<Appointment[]>([]);
  const selectedAppointmentId = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const selectedAppointment = computed(() => {
    return appointments.value.find(apt => apt.id === selectedAppointmentId.value) || null;
  });

  const availableAppointments = computed(() => {
    return appointments.value.filter(apt => !apt.booked);
  });

  // Actions
  const fetchAppointments = async (filters?: Record<string, unknown>): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      const query = new URLSearchParams(filters as Record<string, string>);
      appointments.value = await $fetch(`/api/appointments?${query}`);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      isLoading.value = false;
    }
  };

  const selectAppointment = (id: string): void => {
    selectedAppointmentId.value = id;
  };

  const bookAppointment = async (): Promise<void> => {
    if (!selectedAppointmentId.value) return;
    try {
      isLoading.value = true;
      await $fetch('/api/appointments', {
        method: 'POST',
        body: { appointmentId: selectedAppointmentId.value },
      });
      await fetchAppointments();
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    appointments,
    selectedAppointmentId,
    isLoading,
    error,
    selectedAppointment,
    availableAppointments,
    fetchAppointments,
    selectAppointment,
    bookAppointment,
  };
});
```

### Frontend Architecture Reference

This project uses a **Pinia-Centric Sequential Flow** architecture pattern. For a comprehensive guide on the frontend architecture, component hierarchy, state management, and the complete appointment booking flow, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Key Principles:**
- **Centralized State:** All booking data lives in `bookingStore` (no prop drilling, single source of truth)
- **Route Guards:** Pages validate prerequisites on mount; users cannot skip steps via URL manipulation
- **Component Purity:** Components receive data as props and emit actions; they never hold booking state
- **Composables for API Logic:** API calls and caching are abstracted into composables; store orchestrates the flow
- **Validation Computation:** `isBookingComplete` computed getter enforces required fields across the application

**Quick Reference:**
- Booking starts at `/booking-start` (Step 1: Customer & Vehicle)
- `/availability` for date/time selection (Step 2)
- `/confirmation` for review before submission (Step 3)
- `/summary` shows booking confirmation (Step 4)

Each page has a route guard checking prerequisites. The store manages all state transitions, and composables handle API integration. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed diagrams, data flows, and implementation guidelines.

### Auto-Imports & Module Resolution

Nuxt automatically imports:
- **Components:** from `app/components/` (use them without explicit imports in templates)
- **Composables:** from `app/composables/` (auto-imported with `use` prefix in scripts)
- **Utils:** from `app/utils/` (auto-imported functions and constants)
- **Stores:** from Pinia (use `useStoreName()` without imports)

**Import Path Aliases:**
- `@/` or `~/` → `app/` directory (client-side code)
- `#server/` → `server/` directory (server-side code and types)
- `#app` → Nuxt core runtime
- `~~` or `@@` → Project root

**Important:** Manual imports are still required for custom types. Always import server types using `#server/` alias:
```typescript
// ✅ Correct: Use #server/ for server types
import type { Appointment, Service, Slot } from '#server/utils/types';

// ❌ Wrong: @/ only maps to app/ directory
import type { Appointment } from '@/server/utils/types';

// ✅ Composables are auto-imported, no manual import needed
const { services } = useServices();
const appointment = await createAppointment(payload);
```

## 5. Repository Structure

```
app/                           — Main Vue application files
  app.vue                      — Root application component
  components/                  — Vue SFC components (auto-imported)
    VehicleSelector.vue          — Component for vehicle selection
    ServiceTypeSelector.vue       — Component for service type selection
  composables/                 — Reusable Composition API functions (auto-imported)
    useAppointmentForm.ts        — Form handling composable
    useVehicleData.ts            — Vehicle data fetching composable
  stores/                      — Pinia store definitions (auto-imported)
    appointmentStore.ts          — Appointment booking state
  utils/                       — Shared utility functions (auto-imported)
    formatters.ts                — Date/time formatting utilities
    validators.ts                — Input validation functions
  pages/                       — File-based routing pages (if dynamic routing needed)
server/
  api/                         — Server API routes (Nitro endpoints)
    availability.get.ts        — GET /api/availability endpoint
    services.get.ts            — GET /api/services endpoint
    appointments/index.get.ts  — GET /api/appointments endpoint
    appointments/index.post.ts — POST /api/appointments endpoint
  utils/                       — Server-only utilities
    appointmentStorage.ts      — In-memory appointment storage (replace with DB)
    schedulingLogic.ts         — Business logic for availability checking
    seedData.ts                — Sample data initialization
    types.ts                   — Shared TypeScript types
public/                        — Static assets (never changes)
  robots.txt                   — SEO robots metadata
test/                          — Vitest unit test files
  composables/          — Composable tests
  components/           — Component tests
  utils/                — Testing low level functions and helper 
.nuxt/                         — Build output (generated, do NOT commit)
eslint.config.mjs              — ESLint configuration (flat config)
nuxt.config.ts                 — Nuxt framework configuration
tsconfig.json                  — TypeScript configuration
vitest.config.ts               — Vitest test runner configuration
tailwind.config.ts             — Tailwind CSS configuration (customize if needed)
package.json                   — Dependencies and scripts
AGENTS.md                       — This file (conventions for AI agents)
STORES.md                       — Pinia store documentation registry
```

## 6. Styling Conventions

**Framework:** Tailwind CSS only (via `@nuxtjs/tailwindcss`)

**Key Rules:**
1. **Use standard Tailwind classes only** — Do not use arbitrary pixel values
2. **No inline arbitrary values:** ❌ `gap-[16px]`, ❌ `p-[20px]`, ❌ `w-[300px]`
3. **Use the design scale tokens:** ✅ `gap-4`, ✅ `p-6`, ✅ `w-80`
4. **Responsive modifiers:** Use `sm:`, `md:`, `lg:`, `xl:` prefixes as needed
5. **Utility-first approach:** Build designs from small, composable utilities

**Tailwind Scale Reference:**
- **Spacing:** `0`, `1` (4px), `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px), `12` (48px), etc.
- **Width/Height:** `full`, `screen`, `auto`, `64`, `80`, `96` (max-w-96 = 384px)
- **Text sizes:** `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, etc.
- **Colors:** Use Tailwind palette (`gray`, `blue`, `green`, `red`, `yellow`, `purple`, `pink`, etc.)

**Example Components:**
```vue
<template>
  <!-- Correct: Standard Tailwind classes -->
  <div class="flex items-center gap-4 p-6 rounded-lg bg-gray-100">
    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      Book Appointment
    </button>
  </div>

  <!-- Responsive example -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="p-4 border border-gray-200 rounded-lg">Card</div>
  </div>
</template>
```

**Anti-Patterns:** ❌
```vue
<!-- WRONG: Arbitrary pixel values -->
<div class="gap-[16px] p-[20px] w-[300px]"></div>

<!-- WRONG: Inline styles when Tailwind class exists -->
<div style="padding: 20px; margin-top: 16px;"></div>

<!-- WRONG: Custom CSS for standard patterns -->
<style scoped>
  .my-box {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }
</style>
```

If Tailwind's standard scale doesn't match design needs, extend the `tailwind.config.ts` configuration:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      spacing: {
        '5.5': '1.375rem', // Add custom spacing
      },
      colors: {
        brand: '#custom-color',
      },
    },
  },
};
```

## 7. State Management

See [STORES.md](./STORES.md) for the complete registry and store creation guidelines.

**Quick Reference:**

| Use Case | Solution |
|----------|----------|
| Single component state | `ref()` / `computed()` in component |
| Shared state across 2+ components | Pinia store in `app/stores/` |
| SSR-safe shared state | `useState()` from `@vueuse/nuxt` |
| Persistent state (localStorage) | `useStorage()` from `@vueuse/nuxt` or Pinia with plugin |
| Complex async state | Pinia store with async actions |

**Store Creation Checklist:**
- [ ] File location: `app/stores/myStore.ts`
- [ ] Store ID matches file name (e.g., `defineStore('myStore', ...)`)
- [ ] JSDoc comments describing state, getters, actions
- [ ] All state properties have type annotations
- [ ] All actions have return type annotations
- [ ] Imported in component and stored in setup return for template access
- [ ] Store added to [STORES.md](./STORES.md) registry

## 8. Testing Guidelines

**Test Framework:** Vitest with `@nuxt/test-utils` for Nuxt-specific utilities

**Test File Location:** `test/**/*.{test,spec}.ts`

**Run Tests:**
```bash
npm test              # Run once
npm run test:watch   # Watch mode
```

### Testing Composables
```typescript
// test/composables.spec.ts
import { describe, it, expect } from 'vitest';
import { useAppointmentForm } from '@/app/composables/useAppointmentForm';

describe('useAppointmentForm', () => {
  it('should initialize form with empty values', () => {
    const { form } = useAppointmentForm();
    expect(form.value.vehicleId).toBe('');
  });

  it('should be invalid when form is empty', () => {
    const { form, isValid } = useAppointmentForm();
    expect(isValid.value).toBe(false);

    form.value.vehicleId = '123';
    form.value.serviceType = 'oil-change';
    form.value.date = '2025-05-15';
    expect(isValid.value).toBe(true);
  });

  it('should reset form', () => {
    const { form, reset } = useAppointmentForm();
    form.value.vehicleId = '123';

    reset();

    expect(form.value.vehicleId).toBe('');
  });
});
```

### Testing Pinia Stores
```typescript
// test/stores.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAppointmentStore } from '@/app/stores/appointmentStore';

describe('appointmentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should select appointment', () => {
    const store = useAppointmentStore();
    store.appointments = [{ id: '1', date: '2025-05-15' }];

    store.selectAppointment('1');

    expect(store.selectedAppointmentId).toBe('1');
    expect(store.selectedAppointment?.id).toBe('1');
  });

  it('should filter available appointments', () => {
    const store = useAppointmentStore();
    store.appointments = [
      { id: '1', booked: false },
      { id: '2', booked: true },
      { id: '3', booked: false },
    ];

    expect(store.availableAppointments).toHaveLength(2);
  });
});
```

### Testing Components
```typescript
// test/components.spec.ts
import { describe, it, expect } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils';
import VehicleSelector from '@/app/components/VehicleSelector.vue';

describe('VehicleSelector', () => {
  it('renders vehicle selector', async () => {
    const component = await mountSuspended(VehicleSelector);
    expect(component.find('[data-testid="vehicle-selector"]').exists()).toBe(true);
  });

  it('emits select event when vehicle is clicked', async () => {
    const component = await mountSuspended(VehicleSelector);
    await component.find('button').trigger('click');

    expect(component.emitted('select')).toBeTruthy();
  });
});
```

### Testing Server API Routes
```typescript
// test/api.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useTestingPinia } from '@nuxt/test-utils';

describe('GET /api/appointments', () => {
  it('returns available appointments', async () => {
    const { $fetch } = await import('#app');
    const response = await $fetch('/api/appointments');

    expect(Array.isArray(response)).toBe(true);
    expect(response[0]).toHaveProperty('id');
    expect(response[0]).toHaveProperty('booked');
  });
});
```

## 9. Composables & Utilities

### Composables (Reusable Logic)

Located in `app/composables/`, composables should be extracted when:
1. Logic is reused in 2+ components
2. Complex enough to warrant separation
3. Related to a specific feature concern

**Naming Convention:** `use[FeatureName].ts` (e.g., `useAppointmentForm.ts`, `useVehicleData.ts`)

**Must Include:**
- JSDoc comment explaining purpose and return values
- Type annotations for all parameters and return values
- Examples in comment block if behavior is non-obvious

**Example Composable Structure:**
```typescript
// app/composables/useAppointmentFilters.ts
import { ref, computed } from 'vue';
import type { Appointment } from '@/server/utils/types';

export interface FilterCriteria {
  vehicleId?: string;
  serviceType?: string;
  dateRange?: [string, string];
}

/**
 * useAppointmentFilters - Manage appointment filtering logic
 * 
 * @returns {Object} Filter state and methods
 * - criteria: Reactive filter criteria object
 * - filtered: Computed array of filtered appointments
 * - applyCriteria: Apply new filter criteria
 * - reset: Clear all filters
 */
export function useAppointmentFilters(
  allAppointments: Ref<Appointment[]>
) {
  const criteria = ref<FilterCriteria>({});

  const filtered = computed(() => {
    return allAppointments.value.filter(apt => {
      if (criteria.value.vehicleId && apt.vehicleId !== criteria.value.vehicleId) {
        return false;
      }
      if (criteria.value.serviceType && apt.serviceType !== criteria.value.serviceType) {
        return false;
      }
      return true;
    });
  });

  const applyCriteria = (newCriteria: Partial<FilterCriteria>): void => {
    criteria.value = { ...criteria.value, ...newCriteria };
  };

  const reset = (): void => {
    criteria.value = {};
  };

  return { criteria, filtered, applyCriteria, reset };
}
```

### Utilities (Pure Functions)

Located in `app/utils/`, utilities are pure functions without state or side effects. Use for:
- String/date/number formatting
- Input validation
- Constants and enums
- Helper functions for calculation

**Example Utilities:**
```typescript
// app/utils/formatters.ts
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US');
}

export function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US');
}

// app/utils/validators.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
}

// app/utils/constants.ts
export const SERVICE_TYPES = ['Oil Change', 'Tire Rotation', 'Brake Service'];
export const APPOINTMENT_DURATION_MINUTES = 30;
```

## 10. Environment Setup

**Environment Variables:**

Nuxt runtime config uses `NUXT_` prefixed variables. For client-side access, use `NUXT_PUBLIC_` prefix.

Create `.env` file (do NOT commit to git):
```env
# Server-only (keep secret)
NUXT_API_URL=http://localhost:3001
NUXT_DB_HOST=localhost
NUXT_DB_PASSWORD=secret

# Public (accessible in browser)
NUXT_PUBLIC_APP_NAME=Universal Scheduler
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Access in code:
```typescript
// Server-only
const apiUrl = useRuntimeConfig().apiUrl;

// Client & server
const appName = useRuntimeConfig().public.appName;
```

**Setup Instructions:**
1. Run `npm install` to install dependencies
2. Create `.env` file in project root: `cp .env.example .env` (when available)
3. Fill in required values for your environment
4. Run `npm run dev` to start development server

## 11. Important Constraints

- **Do not commit** `.env`, `.env.local`, or any files containing secrets or API keys
- **Do not commit** `.nuxt/` build directory (it's generated and git-ignored)
- **Open a PR** rather than pushing directly to `main` branch
- **Test coverage:** Run `npm test` before submitting changes; all tests must pass
- **TypeScript:** All files must maintain type safety; no `any` types without explicit `// @ts-ignore` comments with reasoning
- **Linting:** Run `npm run lint` (ESLint) before committing
- **Code formatting:** Run `npx prettier --write .` before committing
- **Stores must be documented:** Every new Pinia store must be added to [STORES.md](./STORES.md) with JSDoc and store registry entry
- **Composables must have JSDoc:** Every composable must include JSDoc explaining purpose, parameters, and return values

---

**Last Updated:** April 30, 2026

This file provides conventions and best practices for AI agents and developers working on the universal-scheduler project. Reference [STORES.md](./STORES.md) for active Pinia store documentation.