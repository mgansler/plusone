import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/nestjs-services',

  plugins: [],

  resolve: {
    tsconfigPaths: true,
  },

  // @ts-expect-error vitest needs this
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'junit'],
    outputFile: '../../reports/test/nestjs-services.xml',
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      reportsDirectory: '../../coverage/libs/nestjs-services',
      provider: 'v8' as const,
    },
  },
})
