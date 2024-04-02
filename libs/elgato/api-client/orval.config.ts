import { defineConfig } from 'orval'

module.exports = defineConfig({
  api: {
    input: { target: '../../../apps/elgato/backend/elgato-internal.json' },
    output: {
      client: 'react-query',
      target: './src/client.ts',
      override: {
        mutator: {
          path: './src/custom-axios.ts',
          name: 'customAxiosInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/elgato/api-client/src/client.ts',
    },
  },
  zod: {
    input: { target: '../../../apps/elgato/backend/elgato-internal.json' },
    output: {
      client: 'zod',
      target: './src/zod.ts',
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/elgato/api-client/src/zod.ts',
    },
  },
})
