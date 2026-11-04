import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

// These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
const configValues = { default: { hmr: false }, development: { hmr: true }, production: { hmr: false } }

// Determine the correct configValue to use based on the configuration
const nxConfiguration = (process.env.NX_TASK_TARGET_CONFIGURATION as keyof typeof configValues) ?? 'default'

const options = {
  ...configValues.default,
  ...(configValues[nxConfiguration] ?? {}),
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/apps/borgo/borgo-web',
  server: {
    port: 4100,
    host: 'localhost',
    hmr: options.hmr,
  },

  preview: {
    port: 4100,
    host: 'localhost',
  },

  plugins: [react(), nxReadySignal()],

  resolve: {
    tsconfigPaths: true,
  },

  build: {
    outDir: '../../../dist/apps/borgo/borgo-web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    name: 'borgo',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/borgo-web.xml',
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../coverage/apps/borgo/borgo-web',
      provider: 'v8' as const,
    },
  },
}))
