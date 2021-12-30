import { join } from 'path'

import type { Tree } from '@nrwl/devkit'
import { addDependenciesToPackageJson, installPackagesTask, readJsonFile } from '@nrwl/devkit'

export function addDependencies(tree: Tree) {
  const { devDependencies } = readJsonFile(join(tree.root, '/package.json'))

  addDependenciesToPackageJson(
    tree,
    {},
    {
      '@cypress/react': 'latest',
      '@cypress/webpack-dev-server': 'latest',
      '@nrwl/cypress': devDependencies['@nrwl/workspace'],
      '@testing-library/cypress': 'latest',
    },
  )

  installPackagesTask(tree)
}
