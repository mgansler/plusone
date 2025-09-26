import { defineConfig } from 'orval'

module.exports = defineConfig({
  api: {
    input: { target: '../../../apps/stgtrails/stgtrails-backend/stgtrails-internal.json' },
    output: {
      client: 'react-query',
      target: './src/gen/client.ts',
      override: {
        enumGenerationType: 'enum',
        mutator: {
          path: './src/custom-axios.ts',
          name: 'customAxiosInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/stgtrails/api-client/src/client.ts',
    },
  },
  zod: {
    input: { target: '../../../apps/stgtrails/stgtrails-backend/stgtrails-internal.json' },
    output: {
      client: 'zod',
      target: './src/gen/zod.ts',
      override: {
        zod: {
          generate: {
            body: false,
            header: false,
            param: false,
            query: false,
            response: true,
          },
          strict: {
            body: true,
            header: true,
            param: true,
            query: true,
            response: true,
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/stgtrails/api-client/src/zod.ts',
    },
  },
})
