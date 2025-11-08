import { execSync } from 'node:child_process'
import { resolve } from 'node:path'

import type { ExecutorContext } from '@nx/devkit'

import type { MigrateExecutorSchema } from './schema'

export default async function runExecutor(
  options: MigrateExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const configPath = resolve(context.projectsConfigurations.projects[context.projectName].root, options.config)
  try {
    execSync(`yarn prisma --config ${configPath} migrate dev`, {
      stdio: 'inherit',
      env: process.env,
    })

    return { success: true }
  } catch (error) {
    console.error('Error executing Prisma command:', error)
    return { success: false }
  }
}
