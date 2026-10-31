module.exports = {
  api: {
    input: { target: '../../../apps/trailcare/trailcare-backend/trailcare-internal.json' },
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
      },
    },
    hooks: {
      afterAllFilesWrite: 'nx format --files libs/trailcare/api-client/src/gen/client.ts',
    },
  },
}
