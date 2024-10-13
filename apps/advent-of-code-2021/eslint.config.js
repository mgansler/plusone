const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')

const baseConfig = require('../../eslint.config.js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...baseConfig,
  ...compat.extends('plugin:@nx/react'),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: { 'no-restricted-imports': 'off' },
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
  {
    ignores: [
      'apps/advent-of-code-2021/build/**',
      'apps/advent-of-code-2021/.cache/**',
      'apps/advent-of-code-2021/public/build/**',
    ],
  },
]
