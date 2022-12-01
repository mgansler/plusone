import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { readConfig } from '@remix-run/dev/dist/config'
import { serve } from '@remix-run/dev/dist/devServer/serve'

type ServeSchema = {
  devServerPort: number
  port: number
  watch?: boolean
}

export default async function (options: ServeSchema, context: ExecutorContext) {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development'
  }
  const mode = context.configurationName === 'production' ? 'production' : 'development'

  const targetRoot = context.workspace.projects[context.projectName].root
  const config = await readConfig(targetRoot)

  config.rootDirectory = context.root
  config.devServerPort = options.devServerPort
  config.cacheDirectory = resolve(context.root, 'tmp', targetRoot, '.cache')
  config.assetsBuildDirectory = resolve(context.root, 'tmp', targetRoot, 'public/build')
  config.serverBuildPath = resolve(context.root, 'tmp', targetRoot, 'build/index.js')

  return serve(config, mode, options.port)
}
