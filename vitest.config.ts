import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**/*', 'tests/e2e/**/*'],
    setupFiles: ['src/test/vitest.setup.ts'],
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/test/**', 'src/types/**'],
      // Thresholds raised toward 50% phase target (2026-06-16).
      // Continue raising by 5-10 points as more components are tested.
      thresholds: {
        statements: 12,
        branches: 9,
        functions: 10,
        lines: 13,
      },
    },
  },
});
