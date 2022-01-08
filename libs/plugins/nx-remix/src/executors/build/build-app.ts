import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { BuildMode } from '@remix-run/dev/build'
import { build } from '@remix-run/dev/compiler'
import { readConfig } from '@remix-run/dev/config'

import type { NormalizedOptions } from './normalize-options'

export async function buildApp(options: NormalizedOptions, context: ExecutorContext) {
  const mode = context.configurationName === 'production' ? BuildMode.Production : BuildMode.Development

  const config = await readConfig(options.targetRoot)
  config.rootDirectory = context.root
  config.cacheDirectory = resolve(context.root, 'tmp', options.targetRoot, '.cache')
  config.assetsBuildDirectory = resolve(context.root, options.outputPath, 'public/build')

  config.serverBuildDirectory = resolve(context.root, options.outputPath, 'build')

  await build(config, { mode, sourcemap: mode === BuildMode.Development })
}
