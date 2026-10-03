import react from '@vitejs/plugin-react'
import * as process from 'process'
import { searchForWorkspaceRoot } from 'vite'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

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
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },

  plugins: [react(), tsconfigPaths()],

  resolve: {
    alias: {
      'node-fetch': 'isomorphic-fetch',
    },
  },

  define: {
    global: {},
  },

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ tsconfigPaths() ],
  // },

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
