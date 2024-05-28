/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/fritzbox-client',

  plugins: [nxViteTsPaths(), dts({ entryRoot: 'src', tsconfigPath: path.join(__dirname, 'tsconfig.lib.json') })],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    ssr: true,
    outDir: '../../dist/libs/fritzbox-client',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'fritzbox-client',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: [],
    },
  },

  // @ts-expect-error vitest needs this
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './vitest.global-setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['src/**/stubs/**/*'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/fritzbox-client',
      provider: 'v8',
      exclude: ['vite.config.mts', 'vitest.global-setup.ts', 'src/index.ts'],
    },
  },
})
