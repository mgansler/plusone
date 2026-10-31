import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/trailcare/trailcare-backend',

  plugins: [tsconfigPaths(), nxReadySignal()],

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/trailcare/trailcare-backend',
      provider: 'v8' as const,
    },
  },
})
