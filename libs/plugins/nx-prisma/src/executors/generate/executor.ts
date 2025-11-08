import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

import type { ExecutorContext } from '@nx/devkit'

import type { GenerateExecutorSchema } from './schema'

export default async function runExecutor(
  options: GenerateExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const configPath = resolve(context.projectsConfigurations.projects[context.projectName].root, options.config)
  const prismaGenerate = spawn('yarn', ['prisma', '--config', configPath, 'generate'])

  return new Promise((resolve) => {
    prismaGenerate.stdout.on('data', (data) => console.log(data.toString()))
    prismaGenerate.stderr.on('data', (data) => console.error(data.toString()))

    prismaGenerate.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
