import { defineConfig } from 'orval'

module.exports = defineConfig({
  api: {
    input: { target: 'http://localhost:3000/api-json' },
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
    input: { target: 'http://localhost:3000/api-json' },
    output: {
      client: 'zod',
      target: './src/zod.ts',
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/elgato/api-client/src/zod.ts',
    },
  },
})
