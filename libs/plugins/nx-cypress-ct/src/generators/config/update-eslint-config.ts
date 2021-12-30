import { join } from 'path'

import type { ProjectConfiguration, Tree } from '@nrwl/devkit'
import { updateJson } from '@nrwl/devkit'

type EslintRcJson = {
  overrides: {
    files: string[]
    rules: object
  }[]
}

export function updateEslintConfig(tree: Tree, projectConfiguration: ProjectConfiguration) {
  updateJson<EslintRcJson, EslintRcJson>(tree, join(projectConfiguration.root, '.eslintrc.json'), (value) => {
    if (!value.overrides.find(({ files }) => files.includes('*.ct.tsx'))) {
      value.overrides.push({
        files: ['*.ct.jsx', '*.ct.tsx'],
        rules: {
          'testing-library/await-async-utils': 'off',
          'testing-library/await-async-query': 'off',
          'testing-library/prefer-screen-queries': 'off',
        },
      })
    }
    return value
  })
}
