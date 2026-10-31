const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
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
          message: '🙅 Unexpected describe.skip. Please remove before committing. 💻👮',
        },
        {
          object: 'describe',
          property: 'only',
          message: '🙅 Unexpected describe.only. Please remove before committing. 💻👮',
        },
        {
          object: 'it',
          property: 'skip',
          message: '🙅 Unexpected it.skip. Please remove before committing. 💻👮',
        },
        {
          object: 'it',
          property: 'only',
          message: '🙅 Unexpected it.only. Please remove before committing. 💻👮',
        },
      ],
    },
  },
]
