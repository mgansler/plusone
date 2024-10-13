const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: { '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }] },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
]
