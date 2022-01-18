import { spawn } from 'child_process'

import { Observable, tap } from 'rxjs'
import { eachValueFrom } from 'rxjs-for-await'

import type { ComposeExecutorSchema } from './schema'

export default async function* (options: ComposeExecutorSchema) {
  return yield* eachValueFrom(startProcesses(options.targets).pipe(tap((t: string) => process.stdout.write(t))))
}

function startProcesses(targets: ComposeExecutorSchema['targets']) {
  return new Observable((subscriber) => {
    const processes = targets.map((target) => {
      const p = spawn('yarn', ['nx', 'run', target])
      p.stderr.on('data', (data) => console.error(target, data.toString()))
      p.stdout.on('data', (data) => subscriber.next(data))

      return p
    })

    return () => {
      processes.forEach((p) => p.kill())
    }
  })
}
