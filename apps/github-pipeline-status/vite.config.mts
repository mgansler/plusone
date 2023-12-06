import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

import react from '@vitejs/plugin-react'
import * as process from 'process'
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
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
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },
})
