import { defineConfig } from 'orval'

module.exports = defineConfig({
  api: {
    input: { target: '../../../apps/feeds/backend/feeds-internal.json' },
    output: {
      client: 'react-query',
      target: './src/client.ts',
      override: {
        mutator: {
          path: './src/custom-axios.ts',
          name: 'customAxiosInstance',
        },
        query: {
          useQuery: true,
          useInfinite: true,
          useInfiniteQueryParam: 'cursor',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/feeds/api-client/src/client.ts',
    },
  },
  zod: {
    input: { target: '../../../apps/feeds/backend/feeds-internal.json' },
    output: {
      client: 'zod',
      target: './src/zod.ts',
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
      afterAllFilesWrite: 'nx format --files libs/feeds/api-client/src/zod.ts',
    },
  },
})
