import { defineConfig } from 'orval'

module.exports = defineConfig({
  api: {
    input: { target: 'http://localhost:3333/api-json' },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/feeds/api/client/src/client.ts',
    },
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
  },
})
