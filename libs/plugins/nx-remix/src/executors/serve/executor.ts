import { spawn } from 'child_process'
import * as path from 'path'

import { ExecutorContext } from '@nrwl/devkit'
import { map, Observable } from 'rxjs'
import { eachValueFrom } from 'rxjs-for-await'

type ServeSchema = {
  port: number
}

export default async function* runExecutor(options: ServeSchema, context: ExecutorContext) {
  return yield* eachValueFrom(
    runRemixDevServer(options, context).pipe(
      map(({ baseUrl }) => ({
        success: true,
        baseUrl,
      })),
    ),
  )
}

function runRemixDevServer(options: ServeSchema, context: ExecutorContext) {
  const projectRoot = context.root
  const targetRoot = context.workspace.projects[context.projectName].root

  return new Observable((subscriber) => {
    const remixDev = spawn(path.join(projectRoot, 'node_modules/.bin/remix'), {
      cwd: path.join(projectRoot, targetRoot),
      env: {
        ...process.env,
        PORT: options.port.toString(),
      },
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
