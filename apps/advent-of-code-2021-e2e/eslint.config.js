const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')

const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...baseConfig,
  ...compat.extends('plugin:cypress/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-properties': 'off',
      'testing-library/await-async-queries': 'off',
      'testing-library/prefer-screen-queries': 'off',
    },
  },
]
