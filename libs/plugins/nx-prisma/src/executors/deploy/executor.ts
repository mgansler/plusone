import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

import type { ExecutorContext } from '@nx/devkit'

import type { DeployExecutorSchema } from './schema'

export default async function runExecutor(
  options: DeployExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const configPath = resolve(context.projectsConfigurations.projects[context.projectName].root, options.config)
  const prismaDeploy = spawn('yarn', ['prisma', '--config', configPath, 'migrate', 'deploy'])

  return new Promise((resolve) => {
    prismaDeploy.stdout.on('data', (data) => console.log(data.toString()))
    prismaDeploy.stderr.on('data', (data) => console.error(data.toString()))

    prismaDeploy.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
