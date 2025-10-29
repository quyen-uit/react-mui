import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
    exclude: [
      'node_modules',
      'dist',
      'src/tests',
      '**/*.d.ts',
      'configs',
      '.husky',
    ],
  },
});

