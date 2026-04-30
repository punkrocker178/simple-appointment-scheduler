# Pinia Stores Documentation

This document provides a registry and reference for all Pinia stores in the universal-scheduler project. Each store is documented with its purpose, state shape, getters, and actions.

## Store Structure Template

When creating a new Pinia store, use this template:

```typescript
import { defineStore } from 'pinia';

/**
 * [Store Name] - Brief description of store purpose
 * 
 * **State:**
 * - property1: Description of property1
 * - property2: Description of property2
 * 
 * **Getters:**
 * - getter1: Description of what getter1 computes
 * 
 * **Actions:**
 * - setProperty1(value): Updates property1
 * - fetchData(): Async action to fetch data
 */
export const useStoreName = defineStore('storeName', () => {
  // State
  const property1 = ref<Type>('initial value');
  const property2 = ref<Type>([]);

  // Getters
  const getter1 = computed(() => {
    // computed logic
  });

  // Actions
  const setProperty1 = (value: Type) => {
    property1.value = value;
  };

  const fetchData = async () => {
    // API call or business logic
  };

  return {
    // State
    property1,
    property2,
    // Getters
    getter1,
    // Actions
    setProperty1,
    fetchData,
  };
});
```

## Active Stores

### (No stores created yet)

Add stores here as they are created. Follow the template above and update this file each time a new store is added.

---

## Guidelines for Store Creation

1. **Location:** All stores live in `app/stores/` directory
2. **File Naming:** Use `camelCase.ts` for store files (e.g., `appointmentStore.ts`, `vehicleStore.ts`)
3. **Store ID:** Use a descriptive camelCase ID that matches the file name (e.g., `'appointmentStore'`)
4. **JSDoc Comments:** Every store must include JSDoc describing state, getters, and actions for AI agents and developers
5. **Composition API:** Use the Composition API pattern with `defineStore()` (not Options API)
6. **Auto-import:** Stores are auto-imported via `@pinia/nuxt`, no need for manual imports in components
7. **Usage in Components:** 
   ```typescript
   import { useAppointmentStore } from '#app';
   
   export default defineComponent({
     setup() {
       const appointmentStore = useAppointmentStore();
       return { appointmentStore };
     }
   });
   ```

## Common Patterns

### Async Actions with Error Handling
```typescript
const fetchAppointments = async () => {
  try {
    isLoading.value = true;
    const response = await $fetch('/api/appointments');
    appointments.value = response;
  } catch (error) {
    error.value = error.message;
  } finally {
    isLoading.value = false;
  }
};
```

### Computed Getters Filtering State
```typescript
const availableAppointments = computed(() => {
  return appointments.value.filter(apt => apt.available);
});
```

### Reset Store State
```typescript
const resetStore = () => {
  appointments.value = [];
  selectedAppointment.value = null;
};
```

---

**Last updated:** April 30, 2026
