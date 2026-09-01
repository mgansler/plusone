import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/elgato/elgato-backend',

  plugins: [nxViteTsPaths()],

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
