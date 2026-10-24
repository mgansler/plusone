module.exports = {
  api: {
    input: { target: '../../../apps/gpx-toolbox/gpx-toolbox-backend/gpx-toolbox-internal.json' },
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
      afterAllFilesWrite: 'nx format --files libs/gpx-toolbox/api-client/src/client.ts',
    },
  },
  zod: {
    input: { target: '../../../apps/gpx-toolbox/gpx-toolbox-backend/gpx-toolbox-internal.json' },
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
      afterAllFilesWrite: 'nx format --files libs/gpx-toolbox/api-client/src/zod.ts',
    },
  },
  strava: {
    input: {
      target: './strava.preprocessed.json',
      parserOptions: {
        externalRefs: {
          allow: ['*'],
        },
      },
    },
    output: {
      mode: 'tags',
      client: 'axios-functions',
      target: './src/gen/strava',
    },
  },
}
