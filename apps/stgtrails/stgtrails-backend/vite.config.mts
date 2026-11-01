import { defineConfig } from 'vitest/config'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/stgtrails/stgtrails-backend',

  plugins: [nxReadySignal()],

  resolve: {
    tsconfigPaths: true,
  },

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/stgtrails/stgtrails-backend',
      provider: 'v8' as const,
    },
  },
})
