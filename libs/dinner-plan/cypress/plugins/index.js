const { join } = require('path')

const { startDevServer } = require('@cypress/webpack-dev-server')
const { getWebpackConfig } = require('@nrwl/cypress/plugins/preprocessor')

module.exports = (on, config) => {
  // When we run `cypress open-ct` we do not get an absolute path
  if (config.env.tsConfig.startsWith('.')) {
    config.env.tsConfig = join(__dirname, '../..', config.env.tsConfig)
  }

  const webpackConfig = getWebpackConfig(config)

  on('dev-server:start', (options) => startDevServer({ options, webpackConfig }))
}
