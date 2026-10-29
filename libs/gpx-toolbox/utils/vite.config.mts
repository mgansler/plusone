import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/gpx',

  plugins: [],

  // @ts-expect-error vitest needs this
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'junit'],
    outputFile: '../../../reports/test/gpx-toolbox-utils.xml',
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../../coverage/libs/gpx-toolbox-utils',
      provider: 'v8' as const,
    },
  },
})
