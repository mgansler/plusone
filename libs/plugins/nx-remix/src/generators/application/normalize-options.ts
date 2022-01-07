import type { Tree } from '@nrwl/devkit'
import { getWorkspaceLayout, names } from '@nrwl/devkit'

import type { ApplicationGeneratorSchema } from './schema'

export interface NormalizedSchema extends ApplicationGeneratorSchema {
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
}

export function normalizeOptions(tree: Tree, options: ApplicationGeneratorSchema): NormalizedSchema {
  const name = names(options.name).fileName
  const projectDirectory = options.directory ? `${names(options.directory).fileName}/${name}` : name
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-')
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`
  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : []

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  }
}
