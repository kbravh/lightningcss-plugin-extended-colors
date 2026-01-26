import { defineConfig } from 'vitest/config';

export default defineConfig({
  ssr: {
    resolve: {
      conditions: ['source'],
    },
  },
  // Configure Vitest (https://vitest.dev/config/)
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
