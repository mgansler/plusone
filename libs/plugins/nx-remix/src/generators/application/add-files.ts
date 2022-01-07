import { join } from 'path'

import type { Tree } from '@nrwl/devkit'
import { generateFiles, names, offsetFromRoot } from '@nrwl/devkit'

import type { NormalizedSchema } from './normalize-options'

export function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  }
  generateFiles(tree, join(__dirname, 'files'), options.projectRoot, templateOptions)
}
