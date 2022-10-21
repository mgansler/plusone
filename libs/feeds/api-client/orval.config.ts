import { defineConfig } from 'orval'

module.exports = defineConfig({
  'config-api': {
    input: { target: 'http://localhost:3333/api-json' },
    hooks: {
      afterAllFilesWrite: 'nx format',
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
