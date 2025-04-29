import { defineVitestConfig } from '@nuxt/test-utils/config';
import { coverageConfigDefaults } from 'vitest/config';

export default defineVitestConfig({
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, 'nuxt.config.ts'],
    },
    environment: 'nuxt',
    globals: true,
  },
});
