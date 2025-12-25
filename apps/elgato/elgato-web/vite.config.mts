/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../../dist/apps/elgato/elgato-web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../../node_modules/.vite/apps/elgato/elgato-web',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: false }), react(), nxViteTsPaths(), tailwindcss()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // @ts-expect-error vitest needs this
  test: {
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/elgato-web.xml',
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/elgato/elgato-web',
      provider: 'v8',
    },
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
