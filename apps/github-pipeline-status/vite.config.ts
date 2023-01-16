import * as process from 'process'

import react from '@vitejs/plugin-react'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

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
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },
})
