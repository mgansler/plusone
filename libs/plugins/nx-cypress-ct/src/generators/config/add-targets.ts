import type { ProjectConfiguration, Tree } from '@nrwl/devkit'
import { updateProjectConfiguration } from '@nrwl/devkit'

import type { ConfigSchema } from './schema'

export function addTargets(tree: Tree, options: ConfigSchema, projectConfiguration: ProjectConfiguration) {
  projectConfiguration.targets = {
    ...projectConfiguration.targets,
    ['ct']: {
      executor: '@nrwl/cypress:cypress',
      options: {
        testingType: 'component',
        cypressConfig: `${projectConfiguration.root}/cypress.json`,
        tsConfig: `${projectConfiguration.root}/tsconfig.ct.json`,
        devServerTarget: '',
      },
      configurations: {
        watch: { watch: true },
      },
    },
  }
  updateProjectConfiguration(tree, options.projectName, projectConfiguration)
}
