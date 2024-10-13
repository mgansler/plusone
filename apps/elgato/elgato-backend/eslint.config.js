const baseConfig = require('../../../eslint.config.js')

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/stubs/*'],
              message: "Don't use stubs in production code.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]
