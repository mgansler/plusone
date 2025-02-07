const nx = require('@nx/eslint-plugin')

const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.{spec,cy}.{ts,tsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'describe',
          property: 'skip',
          message: '\uD83D\uDE45 Unexpected describe.skip. Please remove before committing. \uD83D\uDCBB\uD83D\uDC6E',
        },
        {
          object: 'describe',
          property: 'only',
          message: '\uD83D\uDE45 Unexpected describe.only. Please remove before committing. \uD83D\uDCBB\uD83D\uDC6E',
        },
        {
          object: 'it',
          property: 'skip',
          message: '\uD83D\uDE45 Unexpected it.skip. Please remove before committing. \uD83D\uDCBB\uD83D\uDC6E',
        },
        {
          object: 'it',
          property: 'only',
          message: '\uD83D\uDE45 Unexpected it.only. Please remove before committing. \uD83D\uDCBB\uD83D\uDC6E',
        },
      ],
    },
  },
]
