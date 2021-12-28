import * as path from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { deleteOutputDir } from '@nrwl/web/src/utils/fs'
import { copyAssets } from '@nrwl/workspace/src/utilities/assets'
import { BuildMode } from '@remix-run/dev/build'
import { build } from '@remix-run/dev/compiler'
import { readConfig } from '@remix-run/dev/config'

type ServeSchema = {
  outputPath: string
}

export default async function (options: ServeSchema, context: ExecutorContext) {
  const mode = context.configurationName === 'production' ? BuildMode.Production : BuildMode.Development
  const outputPath = path.resolve(context.root, options.outputPath)

  const targetRoot = context.workspace.projects[context.projectName].root
  const config = await readConfig(targetRoot)

  config.cacheDirectory = path.resolve(context.root, 'tmp', targetRoot, '.cache')
  config.assetsBuildDirectory = path.resolve(outputPath, 'public/build')
  config.serverBuildDirectory = path.resolve(outputPath, 'build')

  deleteOutputDir(context.root, outputPath)

  await copyAssets([`${targetRoot}/public/favicon.ico`], context.root, path.resolve(context.root, 'dist', targetRoot, 'public'))

  await build(config, { mode, sourcemap: mode === BuildMode.Development })

  return { success: true }
}
