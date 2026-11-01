import react from '@vitejs/plugin-react'
import * as process from 'process'
import { searchForWorkspaceRoot } from 'vite'
import { defineConfig } from 'vitest/config'
import { nxReadySignal } from '@nx/vite/plugins/nx-ready-signal.plugin'

// These options were migrated by @nx/vite:convert-to-inferred from the project.json file.
const configValues = { default: {}, development: { hmr: true }, production: { hmr: false } }

// Determine the correct configValue to use based on the configuration
const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default'

const options = {
  ...configValues.default,
  ...(configValues[nxConfiguration] ?? {}),
}

export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: '../../dist/apps/github-pipeline-status',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rolldownOptions: {
      // External packages that should not be bundled into your library.
      external: [],
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'mui',
              test: /node_modules[\\/]@mui[\\/](material|icons-material)/,
            },
          ],
        },
      },
    },
  },
  cacheDir: '../../../node_modules/.vite/apps/github-pipeline-status',

  server: {
    port: 4200,
    host: 'localhost',
    hmr: options.hmr,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },

  plugins: [react(), nxReadySignal()],

  resolve: {
    tsconfigPaths: true,
    alias: {
      'node-fetch': 'isomorphic-fetch',
    },
  },

  define: {
    global: {},
  },

  test: {
    reporters: ['default', 'junit'],
    outputFile: '../../reports/test/github-pipeline-status.xml',
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../coverage/apps/github-pipeline-status',
      provider: 'v8',
    },
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
