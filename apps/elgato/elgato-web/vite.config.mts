import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

// These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
const configValues = { default: { hmr: false }, development: { hmr: true }, production: { hmr: false } }

// Determine the correct configValue to use based on the configuration
const nxConfiguration = (process.env.NX_TASK_TARGET_CONFIGURATION as keyof typeof configValues) ?? 'default'

const options = {
  ...configValues.default,
  ...(configValues[nxConfiguration] ?? {}),
}

export default defineConfig({
  root: import.meta.dirname,
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
    hmr: options.hmr,
    proxy: {
      '/api': {
        target: 'http://localhost:3101',
        secure: false,
      },
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: false, routeFileIgnorePattern: '\\.(spec|test|cy)\\.tsx?$' }),
    react(),
    tailwindcss(),
    nxReadySignal(),
  ],

  resolve: {
    tsconfigPaths: true,
  },

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
