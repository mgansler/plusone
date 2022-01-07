import type { GeneratorCallback, Tree } from '@nrwl/devkit'
import { addProjectConfiguration, formatFiles } from '@nrwl/devkit'
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial'

import { addDependencies } from './add-dependencies'
import { addFiles } from './add-files'
import { addLintTask } from './add-lint-task'
import { normalizeOptions } from './normalize-options'
import type { ApplicationGeneratorSchema } from './schema'

export default async function (tree: Tree, options: ApplicationGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options)
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/app`,
    targets: {
      build: {
        executor: '@mgansler/nx-remix:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}`,
        },
        configurations: {
          production: {},
        },
      },
      serve: {
        executor: '@mgansler/nx-remix:serve',
      },
    },
    tags: normalizedOptions.parsedTags,
  })

  addDependencies(tree)

  const tasks: GeneratorCallback[] = []
  tasks.push(await addLintTask(tree, normalizedOptions))
  runTasksInSerial(...tasks)

  addFiles(tree, normalizedOptions)
  await formatFiles(tree)
}
