const nx = require('@nx/eslint-plugin')
const eslintPluginImport = require('eslint-plugin-import')

module.exports = [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  {
    plugins: {
      import: eslintPluginImport,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@nx/workspace-constructor-args': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.{spec,cy}.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
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
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '@plusone/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@mgansler/**',
              group: 'external',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
    },
  },
]
