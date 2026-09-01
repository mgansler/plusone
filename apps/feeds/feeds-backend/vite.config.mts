import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/feeds/feeds-backend',

  plugins: [nxViteTsPaths()],

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    passWithNoTests: true,
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/feeds/feeds-backend',
      provider: 'v8' as const,
    },
  },
})
