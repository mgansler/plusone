import { join } from 'path'

import type { ProjectConfiguration, Tree } from '@nrwl/devkit'
import { updateJson } from '@nrwl/devkit'

type TSConfigJson = {
  exclude: string[]
  references: { path: string }[]
}

export function updateTsconfigFiles(tree: Tree, projectConfiguration: ProjectConfiguration) {
  // Add reference to tsconfig.json
  updateJson<TSConfigJson, TSConfigJson>(tree, join(projectConfiguration.root, 'tsconfig.json'), (value) => {
    if (!value.references.find(({ path }) => path === './tsconfig.ct.json')) {
      value.references.unshift({ path: './tsconfig.ct.json' })
    }
    return value
  })

  // Exclude cypress/** and **/*.ct.tsx from tsconfig.app.json or tsconfig.lib.json
  const filename = projectConfiguration.projectType === 'application' ? 'tsconfig.app.json' : 'tsconfig.lib.json'
  updateJson<TSConfigJson, TSConfigJson>(tree, join(projectConfiguration.root, filename), (value) => {
    if (!value.exclude.includes('cypress/**')) {
      value.exclude.unshift('cypress/**')
    }
    if (!value.exclude.includes('**/*.ct.tsx')) {
      value.exclude.unshift('**/*.ct.tsx')
    }
    return value
  })
}
