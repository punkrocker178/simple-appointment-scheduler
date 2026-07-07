<script setup lang="ts">
const route = useRoute();
const { register, isLoading, error, isAuthenticated, role } = useAuth();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');
const formError = ref<string | null>(null);

const rules = formRules;

onMounted(async () => {
  const authStore = useAuthStore();
  const tokenCookie = useCookie('auth-token');

  if (!isAuthenticated.value && tokenCookie.value) {
    try {
      await authStore.fetchMe();
    }
    catch {
      return;
    }
  }

  if (isAuthenticated.value) {
    await navigateTo(getPostLoginRedirect(role.value, route.query.redirect));
  }
});

const handleSubmit = async (): Promise<void> => {
  formError.value = null;
  try {
    await register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      phone: phone.value.trim() || undefined,
    });
    await navigateTo(getPostLoginRedirect(role.value, route.query.redirect));
  }
  catch {
    formError.value = error.value ?? 'Registration failed. Please try again.';
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-6">
    <v-card class="w-full max-w-md p-6 rounded-xl">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Create account
      </h1>
      <p class="text-sm text-gray-600 mb-6">
        Register to book service appointments at your dealership
      </p>

      <v-alert
        v-if="formError"
        type="error"
        variant="tonal"
        class="mb-4"
        data-testid="register-error"
      >
        {{ formError }}
      </v-alert>

      <v-form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <v-text-field
            v-model="firstName"
            label="First name"
            autocomplete="given-name"
            required
            :rules="[rules.required]"
            data-testid="register-first-name"
          />

          <v-text-field
            v-model="lastName"
            label="Last name"
            autocomplete="family-name"
            required
            :rules="[rules.required]"
            data-testid="register-last-name"
          />

          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            required
            :rules="[rules.required, rules.email]"
            data-testid="register-email"
          />

          <v-text-field
            v-model="phone"
            label="Phone (optional)"
            type="tel"
            autocomplete="tel"
            data-testid="register-phone"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            autocomplete="new-password"
            required
            :rules="[rules.required]"
            data-testid="register-password"
          />
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          class="mt-6"
          :loading="isLoading"
          :disabled="isLoading"
          data-testid="register-submit"
        >
          Create account
        </v-btn>
      </v-form>

      <p class="text-sm text-gray-600 mt-6 text-center">
        Already have an account?
        <NuxtLink
          to="/login"
          class="text-blue-600 hover:text-blue-700 font-medium"
          data-testid="register-login-link"
        >
          Sign in
        </NuxtLink>
      </p>
    </v-card>
  </div>
</template>
