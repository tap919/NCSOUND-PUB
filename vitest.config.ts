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
      // Thresholds: 50% phase coverage achieved (2026-06-16).
      // Raise to 40/35/40/40 for 100% phase target.
      thresholds: {
        statements: 31,
        branches: 24,
        functions: 26,
        lines: 35,
      },
    },
  },
});
