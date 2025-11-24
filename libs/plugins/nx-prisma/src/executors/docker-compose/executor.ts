import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { promisify } from 'node:util'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { spawn } from 'node:child_process'

import type { ExecutorContext } from '@nx/devkit'

import type { DockerComposeExecutorSchema } from './schema'

const exec = promisify(require('node:child_process').exec)

export default async function dockerComposeExecutor(option: DockerComposeExecutorSchema, context: ExecutorContext) {
  const composePath = resolve(context.projectsConfigurations.projects[context.projectName].root, option.path)

  if (!existsSync(composePath)) {
    throw new Error(`File ${composePath} does not exist`)
  }

  const allServices: Array<string> = (await exec(`docker compose -f ${composePath} config --services`)).stdout
    .split('\n')
    .filter(Boolean)
  const runningServices = new Set<string>(
    (await exec(`docker compose -f ${composePath} ps --all --services --filter "status=running"`)).stdout
      .split('\n')
      .filter(Boolean),
  )

  if (allServices.every((service) => runningServices.has(service))) {
    console.info('All services are running, no need to restart them')
    const log = (await exec(`docker compose -f ${composePath} logs`)).stdout
    if (log.includes(option.readyLogStatement)) {
      console.info('Ready log statement found, exiting')
      return { success: true }
    }
  }

  const hasCreatedServices =
    new Set<string>(
      (await exec(`docker compose -f ${composePath} ps --all --services`)).stdout.split('\n').filter(Boolean),
    ).size > 0

  let logsCommand: ChildProcessWithoutNullStreams
  if (hasCreatedServices) {
    console.info('Some services are not running, restarting them...')
    // Attach to the logs and follow from now on (ignoring older log statements)
    logsCommand = spawn(`docker compose -f ${composePath} logs --follow --since 0s`, { shell: true })
    await exec(`docker compose -f ${composePath} up -d`)
  } else {
    console.info('No services are running, starting them...')
    // Start the containers first and then follow the logs from the beginning
    await exec(`docker compose -f ${composePath} up -d`)
    logsCommand = spawn(`docker compose -f ${composePath} logs --follow`, { shell: true })
  }

  const ready = new Promise((resolve) => {
    logsCommand.stdout.on('data', (data) => {
      if (data.toString().includes(option.readyLogStatement)) {
        resolve({ success: true })
        console.info('Ready log statement found, exiting')
        logsCommand.kill()
      }
    })
  })

  const result = await Promise.race([
    ready,
    new Promise((resolve) => setTimeout(() => resolve({ success: false }), option.timeout * 1_000)),
  ])

  // TODO: check actual connection status
  return new Promise((resolve) => setTimeout(() => resolve(result), 2000))
}
