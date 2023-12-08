import { defineConfig } from 'orval'

module.exports = defineConfig({
  api: {
    input: { target: 'apps/feeds/backend/openapi-feeds.json' },
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
    input: { target: 'http://localhost:3333/api-json' },
    output: {
      client: 'zod',
      target: './src/zod.ts',
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/feeds/api-client/src/zod.ts',
    },
  },
})
