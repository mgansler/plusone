const { join } = require('path')

const { startDevServer } = require('@cypress/webpack-dev-server')
const { getWebpackConfig, preprocessTypescript } = require('@nrwl/cypress/plugins/preprocessor')

module.exports = (on, config) => {
  on('file:preprocessor', preprocessTypescript(config))

  // For when we run `npx cypress open-ct -C cypress.json` from the components directory
  if (config.env.tsConfig.startsWith('.')) {
    config.env.tsConfig = join(__dirname, '../..', config.env.tsConfig)
  }

  const webpackConfig = getWebpackConfig(config)

  on('dev-server:start', (options) => startDevServer({ options, webpackConfig }))
}
