import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['server/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.{js,ts}'],
      exclude: [
        'server/**/*.{test,spec}.{js,ts}',
        'server/**/*.config.{js,ts}',
        'server/vite.ts',
        'server/index.ts',
        'node_modules/',
        'dist/',
      ],
    },
  },
});
