import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'

import type { BuildOptions } from './schema'

export interface NormalizedOptions extends BuildOptions {
  outputPath: string
  targetRoot: string
}

export function normalizeOptions(options: BuildOptions, context: ExecutorContext): NormalizedOptions {
  return {
    ...options,
    outputPath: resolve(context.root, options.outputPath),
    targetRoot: context.workspace.projects[context.projectName].root,
  }
}
