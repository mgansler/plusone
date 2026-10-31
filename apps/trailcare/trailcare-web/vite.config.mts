import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

// These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
const configValues = { default: {}, development: { hmr: true }, production: { hmr: false } }

// Determine the correct configValue to use based on the configuration
const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default'

const options = {
  ...configValues.default,
  ...(configValues[nxConfiguration] ?? {}),
}

const root = import.meta.dirname

export default defineConfig({
  root,
  build: {
    outDir: '../../../dist/apps/trailcare/trailcare-web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../../node_modules/.vite/apps/trailcare/trailcare-web',

  server: {
    port: 4105,
    host: 'localhost',
    hmr: options.hmr,
    proxy: {
      '/api': {
        target: 'http://localhost:3105',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4205,
    host: 'localhost',
  },

  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: false }), react(), tsconfigPaths(), nxReadySignal()],

  test: {
    watch: false,
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/trailcare-web.xml',
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/trailcare/trailcare-web',
      provider: 'v8',
    },
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
