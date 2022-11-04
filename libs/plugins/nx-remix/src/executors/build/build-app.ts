import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { build } from '@remix-run/dev/dist/compiler/build'
import { readConfig } from '@remix-run/dev/dist/config'

import type { NormalizedOptions } from './normalize-options'

export async function buildApp(options: NormalizedOptions, context: ExecutorContext) {
  const mode = context.configurationName === 'production' ? 'production' : 'development'

  const config = await readConfig(options.targetRoot)
  config.rootDirectory = context.root
  config.cacheDirectory = resolve(context.root, 'tmp', options.targetRoot, '.cache')
  config.assetsBuildDirectory = resolve(context.root, options.outputPath, 'public/build')

  config.serverBuildPath = resolve(context.root, options.outputPath, 'build/index.js')

  await build(config, { mode, sourcemap: mode === 'development' })
}
