const { join } = require('path')

const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')

// These options were migrated from the removed @nx/webpack:webpack executor in project.json.
const configValues = {
  default: {
    assets: ['./src/assets'],
    compiler: 'tsc',
    generatePackageJson: true,
    main: './src/main.ts',
    target: 'node',
    tsConfig: join(__dirname, 'tsconfig.app.json'),
    outputHashing: 'none',
  },
  'api-spec': {
    main: './src/generate-openapi-spec.ts',
  },
  development: {},
  production: {
    optimization: true,
    extractLicenses: true,
    assets: [
      './src/assets',
      {
        input: 'libs/trailcare/persistence/',
        glob: 'prisma.config.ts',
        output: '',
      },
      {
        input: 'libs/trailcare/persistence/',
        glob: 'schema.prisma',
        output: '',
      },
      {
        input: 'libs/trailcare/persistence/',
        glob: 'migrations',
        output: 'migrations',
      },
      {
        input: 'dist/apps/trailcare/trailcare-web',
        glob: '**',
        output: 'web',
      },
    ],
  },
}

// Determine the correct configValue to use based on the configuration
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default'

const options = {
  ...configValues.default,
  ...configValues[configuration],
}

module.exports = {
  output: {
    path: join(__dirname, '../../../dist/apps/trailcare/trailcare-backend'),
  },
  plugins: [new NxAppWebpackPlugin(options)],
}
