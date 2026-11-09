import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

// These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
const configValues = { default: { hmr: false }, development: { hmr: true }, production: { hmr: false } }

// Determine the correct configValue to use based on the configuration
const nxConfiguration = (process.env.NX_TASK_TARGET_CONFIGURATION as keyof typeof configValues) ?? 'default'

const options = {
  ...configValues.default,
  ...(configValues[nxConfiguration] ?? {}),
}

const root = import.meta.dirname

export default defineConfig({
  root,
  build: {
    outDir: '../../../dist/apps/gpx-toolbox/gpx-toolbox-web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../../node_modules/.vite/apps/gpx-toolbox/gpx-toolbox-web',

  server: {
    port: 4250,
    host: 'localhost',
    hmr: options.hmr,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4350,
    host: 'localhost',
  },

  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: false, routeFileIgnorePattern: '\\.(spec|cy)\\.tsx?$' }),
    react(),
    nxReadySignal(),
  ],

  resolve: {
    tsconfigPaths: true,
  },

  test: {
    watch: false,
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/gpx-toolbox-web.xml',
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/gpx-toolbox/gpx-toolbox-web',
      provider: 'v8',
    },
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
