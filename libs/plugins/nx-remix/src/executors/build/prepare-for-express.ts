import { copyFileSync } from 'fs'
import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'
import { writeJsonFile } from '@nrwl/devkit'
import { readCachedProjectGraph } from '@nrwl/workspace/src/core/project-graph'
import { createPackageJson } from '@nrwl/workspace/src/utilities/create-package-json'

import type { NormalizedOptions } from './normalize-options'

export function prepareForExpress(options: NormalizedOptions, context: ExecutorContext) {
  const projGraph = readCachedProjectGraph()
  const packageJson = createPackageJson(context.projectName, projGraph, {
    projectRoot: options.targetRoot,
    root: context.root,
  })
  packageJson.main = 'server.js'
  packageJson.dependencies = {
    ...packageJson.dependencies,
    '@remix-run/express': packageJson.dependencies.remix,
    '@remix-run/react': packageJson.dependencies.remix,
    'compression': 'latest',
    'express': 'latest',
    'morgan': 'latest',
  }

  const serverSrc = typeof options.express === 'string' ? resolve(options.targetRoot, options.express) : resolve(__dirname, 'files/express/server.js')

  copyFileSync(serverSrc, resolve(options.outputPath, 'server.js'))
  writeJsonFile(resolve(options.outputPath, 'package.json'), packageJson)
}
