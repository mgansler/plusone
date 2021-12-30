import type { Tree } from '@nrwl/devkit'
import { formatFiles, readProjectConfiguration } from '@nrwl/devkit'

import { addDependencies } from './add-dependencies'
import { addFiles } from './add-files'
import { addTargets } from './add-targets'
import type { ConfigSchema } from './schema'
import { updateEslintConfig } from './update-eslint-config'
import { updateTsconfigFiles } from './update-tsconfig-files'

export default async function (tree: Tree, options: ConfigSchema) {
  const projectConfiguration = readProjectConfiguration(tree, options.projectName)

  addDependencies(tree)
  addFiles(tree, options, projectConfiguration)
  addTargets(tree, options, projectConfiguration)
  updateEslintConfig(tree, projectConfiguration)
  updateTsconfigFiles(tree, projectConfiguration)
  await formatFiles(tree)
}
