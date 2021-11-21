import { addProjectConfiguration, removeProjectConfiguration, Tree } from '@nrwl/devkit'
import { readWorkspaceJson } from '@nrwl/workspace'

export default async function (tree: Tree) {
  Object.entries(readWorkspaceJson().projects).forEach(([name, config]) => {
    removeProjectConfiguration(tree, name)
    addProjectConfiguration(tree, name, config, true)
  })
}
