import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/elgato/elgato-backend',

  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/stubs/**/*'],
      reportsDirectory: '../../../coverage/apps/elgato/elgato-backend',
      provider: 'v8' as const,
    },
  },
})
