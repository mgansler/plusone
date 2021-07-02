import { join } from 'path'

import {
  generateFiles,
  updateJson,
  formatFiles,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nrwl/devkit'

import { Schema } from './schema'

export default async function (tree: Tree, { project, video }: Schema) {
  const projectConfiguration = readProjectConfiguration(tree, project)
  const { root } = projectConfiguration

  // Disable testing-library/* rules for component tests (they are made for jest tests)
  updateJson(tree, join(root, '.eslintrc.json'), (value) => {
    if (!value.overrides.find(({ files }) => files.includes('*.ct.tsx'))) {
      value.overrides.push({
        files: ['*.ct.jsx', '*.ct.tsx'],
        rules: {
          'testing-library/await-async-query': 'off',
          'testing-library/prefer-screen-queries': 'off',
        },
      })
    }
    return value
  })

  // Create cypress.json, tsconfig.ct.json and the cypress directory
  generateFiles(tree, join(__dirname, 'templates'), root, {
    relativeToRoot: Array(root.split('/').length).fill('..').join('/'),
    root,
    tmpl: '',
    video,
  })

  // Update tsconfig files
  updateJson(tree, join(root, 'tsconfig.json'), (value) => {
    if (!value.references.find(({ path }) => path === './tsconfig.ct.json')) {
      value.references.unshift({ path: './tsconfig.ct.json' })
    }
    return value
  })
  updateJson(tree, join(root, 'tsconfig.lib.json'), (value) => {
    if (!value.exclude.includes('**/*.ct.tsx')) {
      value.exclude.unshift('**/*.ct.tsx')
    }
    return value
  })

  // Add 'ct' and 'open-ct' targets in workspace.json
  projectConfiguration.targets = {
    ...projectConfiguration.targets,
    ['open-ct']: {
      executor: '@nrwl/workspace:run-commands',
      options: {
        command: 'cypress open-ct',
        cwd: root,
      },
    },
    ['ct']: {
      executor: '@nrwl/cypress:cypress',
      options: {
        testingType: 'component',
        cypressConfig: `${root}/cypress.json`,
        tsConfig: `${root}/tsconfig.ct.json`,
        devServerTarget: '',
      },
    },
  }
  updateProjectConfiguration(tree, project, projectConfiguration)

  await formatFiles(tree)
}
