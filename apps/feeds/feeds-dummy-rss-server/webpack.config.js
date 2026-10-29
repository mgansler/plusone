const { join } = require('path')

const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')

// These options were migrated from the removed @nx/webpack:webpack executor in project.json.
const configValues = {
  default: {
    target: 'node',
    compiler: 'tsc',
    main: './src/main.ts',
    tsConfig: join(__dirname, 'tsconfig.app.json'),
    assets: ['./src/feeds'],
    outputHashing: 'none',
  },
  development: {},
  production: {},
}

// Determine the correct configValue to use based on the configuration
const configuration = process.env.NX_TASK_TARGET_CONFIGURATION || 'default'

const options = {
  ...configValues.default,
  ...configValues[configuration],
}

module.exports = {
  output: {
    path: join(__dirname, '../../../dist/apps/feeds/feeds-dummy-rss-server'),
  },
  plugins: [new NxAppWebpackPlugin(options)],
}
