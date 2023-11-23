/// <reference types="vitest" />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { unstable_vitePlugin as remix } from '@remix-run/dev'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

export default defineConfig({
  cacheDir: '../../node_modules/.vite/advent-of-code-2021',

  server: {
    fs: {
      allow: ['../..'],
    },
  },

  plugins: [remix(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
    },
    include: ['app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
} as UserConfig)
