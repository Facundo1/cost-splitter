import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import groupPage from './scripts/group-page.mjs';

export default defineConfig({
  plugins: [react(), groupPage()],
  // Relative base so the same build works on GitHub Pages (/<repo>/) and locally.
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
