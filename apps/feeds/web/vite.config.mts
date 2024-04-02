/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { replaceFiles } from '@nx/vite/plugins/rollup-replace-files.plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../../dist/apps/feeds/web',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../../node_modules/.vite/apps/feeds/web',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    replaceFiles([
      {
        replace: 'apps/feeds/web/src/environments/environment.ts',
        with: 'apps/feeds/web/src/environments/environment.prod.ts',
      },
    ]),

    nxViteTsPaths(),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // @ts-expect-error vitest needs this
  test: {
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/feeds-web.xml',
    coverage: {
      reportsDirectory: '../../../coverage/apps/feeds/web',
      provider: 'v8',
    },
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
