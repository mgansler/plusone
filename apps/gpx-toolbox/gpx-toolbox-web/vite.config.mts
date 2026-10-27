import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = import.meta.dirname

export default defineConfig({
  root,
  resolve: {
    alias: {
      'leaflet-locatecontrol': resolve(root, 'src/lib/L.Control.Locate.min.js'),
    },
  },
  build: {
    outDir: '../../../dist/apps/gpx-toolbox/gpx-toolbox-web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../../node_modules/.vite/apps/gpx-toolbox/gpx-toolbox-web',

  server: {
    port: 4250,
    host: 'localhost',
    fs: {
      allow: [resolve(root, '../../../node_modules/leaflet/dist')],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4350,
    host: 'localhost',
  },

  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: false }), react(), tsconfigPaths()],

  test: {
    watch: false,
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/gpx-toolbox-web.xml',
    coverage: {
      reporter: ['html', 'clover', 'json', 'cobertura'],
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/apps/gpx-toolbox/gpx-toolbox-web',
      provider: 'v8',
    },
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
