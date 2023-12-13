/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

import react from '@vitejs/plugin-react'
import * as process from 'process'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/github-pipeline-status',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },

  plugins: [react(), nxViteTsPaths()],

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
  //  plugins: [ nxViteTsPaths() ],
  // },

  // @ts-expect-error vitest needs this
  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/github-pipeline-status',
      provider: 'v8',
    },
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
