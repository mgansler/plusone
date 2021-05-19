const { preprocessTypescript } = require('@nrwl/cypress/plugins/preprocessor')

module.exports = (on, config) => {
  on('file:preprocessor', preprocessTypescript(config))

  require('@cypress/react/plugins/babel')(on, config)
  return config
}
