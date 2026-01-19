module.exports = {
  api: {
    input: { target: '../../../apps/feeds/feeds-backend/feeds-internal.json' },
    output: {
      httpClient: 'axios',
      client: 'react-query',
      target: './src/gen/client.ts',
      override: {
        enumGenerationType: 'enum',
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
    input: { target: '../../../apps/feeds/feeds-backend/feeds-internal.json' },
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
      afterAllFilesWrite: 'nx format --files libs/feeds/api-client/src/zod.ts',
    },
  },
}
