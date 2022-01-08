import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { deleteOutputDir } from '@nrwl/web/src/utils/fs'
import { copyAssets } from '@nrwl/workspace/src/utilities/assets'

import { buildApp } from './build-app'
import { normalizeOptions } from './normalize-options'
import { prepareForExpress } from './prepare-for-express'
import type { BuildOptions } from './schema'

export default async function (options: BuildOptions, context: ExecutorContext) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
  }

  const normalizedOptions = normalizeOptions(options, context)

  deleteOutputDir(context.root, normalizedOptions.outputPath)
  await buildApp(normalizedOptions, context)

  if (normalizedOptions.express) {
    prepareForExpress(normalizedOptions, context)
  }
  await copyAssets([`${normalizedOptions.targetRoot}/public/favicon.ico`], context.root, resolve(context.root, 'dist', normalizedOptions.targetRoot, 'public'))

  console.log(`Successfully built '${context.projectName}'`)
  return { success: true }
}
