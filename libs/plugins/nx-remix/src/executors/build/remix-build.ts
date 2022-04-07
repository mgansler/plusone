import { copyFileSync } from 'fs'
import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { deleteOutputDir } from '@nrwl/web/src/utils/fs'

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
  copyFileSync(resolve(context.root, normalizedOptions.targetRoot, 'public/favicon.ico'), resolve(context.root, 'dist', normalizedOptions.targetRoot, 'public/favicon.ico'))

  console.log(`Successfully built '${context.projectName}'`)
  return { success: true }
}
