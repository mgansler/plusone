import { copyFileSync } from 'fs'
import { resolve } from 'path'

import type { ExecutorContext } from '@nx/devkit'
import { writeJsonFile } from '@nx/devkit'
import { createPackageJson } from '@nx/js'
import { readCachedProjectGraph } from '@nx/workspace/src/core/project-graph'

import type { NormalizedOptions } from './normalize-options'

export function prepareForExpress(options: NormalizedOptions, context: ExecutorContext) {
  const projGraph = readCachedProjectGraph()
  const packageJson = createPackageJson(context.projectName, projGraph, {
    root: context.root,
  })
  packageJson.main = 'server.js'
  packageJson.dependencies = {
    ...packageJson.dependencies,
    '@remix-run/express': packageJson.dependencies.remix,
    '@remix-run/react': packageJson.dependencies.remix,
    compression: 'latest',
    express: 'latest',
    morgan: 'latest',
  }

  const serverSrc =
    typeof options.express === 'string'
      ? resolve(options.targetRoot, options.express)
      : resolve(__dirname, 'files/express/server.js')

  copyFileSync(serverSrc, resolve(options.outputPath, 'server.js'))
  writeJsonFile(resolve(options.outputPath, 'package.json'), packageJson)
}
