import { spawn } from 'child_process'
import path = require('path')

import { ExecutorContext } from '@nrwl/devkit'
import { map, Observable } from 'rxjs'
import { eachValueFrom } from 'rxjs-for-await'

// eslint-disable-next-line @typescript-eslint/ban-types
type Schema = {}

export default async function* (schema: Schema, context: ExecutorContext) {
  const projectRoot = context.root
  const targetRoot = context.workspace.projects[context.projectName].root

  return yield* eachValueFrom(
    runRemixDevServer(projectRoot, targetRoot).pipe(
      map(({ baseUrl }) => ({
        success: true,
        baseUrl,
      })),
    ),
  )
}

function runRemixDevServer(projectRoot, targetRoot) {
  return new Observable((subscriber) => {
    const remixDev = spawn(path.join(projectRoot, 'node_modules/.bin/remix'), {
      cwd: path.join(projectRoot, targetRoot),
    })

    remixDev.stdout.on('data', (data) => {
      console.log(data.toString())
      const matches = data.toString().match(/Remix App Server started at (https?:\/\/.+)/)
      if (matches) {
        subscriber.next({ baseUrl: matches[1] })
      }
    })

    remixDev.stderr.on('data', (data) => console.error(data.toString()))

    return () => remixDev.kill()
  })
}
