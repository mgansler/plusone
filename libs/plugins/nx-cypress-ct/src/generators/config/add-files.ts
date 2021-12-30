import { join } from 'path'

import type { ProjectConfiguration, Tree } from '@nrwl/devkit'
import { generateFiles, offsetFromRoot } from '@nrwl/devkit'

import type { ConfigSchema } from './schema'

export function addFiles(tree: Tree, options: ConfigSchema, projectConfiguration: ProjectConfiguration) {
  const templateOptions = {
    ...options,
    projectRoot: projectConfiguration.root,
    offsetFromRoot: offsetFromRoot(projectConfiguration.root),
    template: '',
  }
  generateFiles(tree, join(__dirname, 'files'), projectConfiguration.root, templateOptions)
}
