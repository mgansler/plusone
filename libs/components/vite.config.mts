import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/libs/components',

  plugins: [react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // @ts-expect-error vitest needs this
  test: {
    reporters: ['default', 'junit'],
    outputFile: '../../reports/test/components.xml',
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./setupTests.ts'],
    coverage: {
      reportsDirectory: '../../coverage/libs/components',
      provider: 'v8',
    },
  },
})
