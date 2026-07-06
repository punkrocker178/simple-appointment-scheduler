// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    rules: {
      semi: ['error', 'always'],
      'vue/valid-v-slot': 'off',
    },
  }
);
