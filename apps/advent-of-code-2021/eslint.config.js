const nx = require('@nx/eslint-plugin')

const baseConfig = require('../../eslint.config.js')

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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
