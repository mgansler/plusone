import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/libs/dark-mode-theme-provider',

  plugins: [react()],

  resolve: {
    tsconfigPaths: true,
  },

  test: {
    reporters: ['default', 'junit'],
    outputFile: '../../reports/test/dark-mode-theme-provider.xml',
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./setupTests.ts'],
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../coverage/libs/dark-mode-theme-provider',
      provider: 'v8',
    },
  },
})
