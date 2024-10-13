const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: { '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }] },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
]
