<script setup lang="ts">
const route = useRoute();
const { login, isLoading, error, isAuthenticated } = useAuth();

const email = ref('');
const password = ref('');
const formError = ref<string | null>(null);

const redirectTarget = computed((): string => {
  const redirect = route.query.redirect;
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/admin';
});

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo(redirectTarget.value);
  }
});

const rules = formRules;

const handleSubmit = async (): Promise<void> => {
  formError.value = null;
  try {
    await login(email.value, password.value);
    await navigateTo(redirectTarget.value);
  }
  catch {
    formError.value = error.value ?? 'Invalid email or password.';
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6">
    <v-card class="w-full max-w-md p-6 rounded-xl">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Sign in
      </h1>
      <p class="text-sm text-gray-600 mb-6">
        Admin and staff access for Universal Scheduler
      </p>

      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        class="mb-4"
        data-testid="login-error"
      >
        {{ formError }}
      </v-alert>

      <v-form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            required
            :rules="[rules.required, rules.email]"
            data-testid="login-email"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            required
            :rules="[rules.required]"
            data-testid="login-password"
          />
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          class="mt-6"
          :loading="isLoading"
          :disabled="isLoading"
          data-testid="login-submit"
        >
          Sign in
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>
