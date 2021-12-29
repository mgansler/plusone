import type { Server } from 'http'
import * as path from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { copyAssets } from '@nrwl/workspace/src/utilities/assets'
import { BuildMode } from '@remix-run/dev/build'
import { watch } from '@remix-run/dev/cli/commands'
import type { RemixConfig } from '@remix-run/dev/config'
import { readConfig } from '@remix-run/dev/config'
import { createApp } from '@remix-run/serve'
import * as express from 'express'
import { map, Observable } from 'rxjs'
import { eachValueFrom } from 'rxjs-for-await'

type ServeSchema = {
  devServerPort: number
  port: number
}

export default async function* (options: ServeSchema, context: ExecutorContext) {
  const targetRoot = context.workspace.projects[context.projectName].root
  const config = await readConfig(targetRoot)

  config.rootDirectory = context.root
  config.devServerPort = options.devServerPort
  config.cacheDirectory = path.resolve(context.root, 'tmp', targetRoot, '.cache')
  config.assetsBuildDirectory = path.resolve(context.root, 'tmp', targetRoot, 'public/build')
  config.serverBuildDirectory = path.resolve(context.root, 'tmp', targetRoot, 'build')

  await copyAssets(
    [`${targetRoot}/public/favicon.ico`],
    context.root,
    path.resolve(context.root, 'tmp', targetRoot, 'public'),
  )

  return yield* eachValueFrom(
    runRemixDevServer(options, config).pipe(
      map(({ baseUrl }) => ({
        success: true,
        baseUrl,
      })),
    ),
  )
}

function runRemixDevServer(options: ServeSchema, config: RemixConfig) {
  return new Observable((subscriber) => {
    const app = express()
    app.use(express.static(path.join(config.assetsBuildDirectory, '..')))
    app.use((_, __, next) => {
      purgeAppRequireCache(config.serverBuildDirectory)
      next()
    })
    app.use(createApp(config.serverBuildDirectory, BuildMode.Development))
    let server: Server | null = null

    watch(config, BuildMode.Development, {
      onInitialBuild: () => {
        server = app.listen(options.port, () => {
          console.log(`Remix App Server started at http://localhost:${options.port}`)
        })
        subscriber.next({ baseUrl: `http://localhost:${options.port}` })
      },
    })

    return () => server.close()
  })
}

function purgeAppRequireCache(buildPath: string) {
  for (const key in require.cache) {
    if (key.startsWith(buildPath)) {
      delete require.cache[key]
    }
  }
}
