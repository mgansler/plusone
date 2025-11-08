import { spawn } from 'node:child_process'
import { resolve } from 'path'

import type { ExecutorContext } from '@nx/devkit'

import type { ValidateExecutorSchema } from './schema'

export default async function runExecutor(
  options: ValidateExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const configPath = resolve(context.projectsConfigurations.projects[context.projectName].root, options.config)
  const prismaValidate = spawn('yarn', ['prisma', '--config', configPath, 'validate'])

  return new Promise((resolve) => {
    prismaValidate.stdout.on('data', (data) => console.log(data.toString()))
    prismaValidate.stderr.on('data', (data) => console.error(data.toString()))

    prismaValidate.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
