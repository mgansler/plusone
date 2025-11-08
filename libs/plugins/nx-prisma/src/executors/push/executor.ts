import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

import type { ExecutorContext } from '@nx/devkit'

import type { PushExecutorSchema } from './schema'

export default async function runExecutor(
  options: PushExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const configPath = resolve(context.projectsConfigurations.projects[context.projectName].root, options.config)
  const prismaPush = spawn('yarn', ['prisma', '--config', configPath, 'db', 'push'])

  return new Promise((resolve) => {
    prismaPush.stdout.on('data', (data) => console.log(data.toString()))
    prismaPush.stderr.on('data', (data) => console.error(data.toString()))

    prismaPush.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
