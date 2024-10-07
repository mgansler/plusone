import { spawn } from 'child_process'
import { join } from 'path'

import type { ExecutorContext } from '@nx/devkit'

import type { FormatExecutorSchema } from './schema'

export default async function runExecutor(
  options: FormatExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const schemaPath = join(context.projectsConfigurations.projects[context.projectName].sourceRoot, options.schema)
  const args: Array<string> = ['prisma', 'migrate', 'deploy', '--schema', schemaPath]
  const prismaDeploy = spawn('yarn', args)

  return new Promise((resolve) => {
    prismaDeploy.stdout.on('data', (data) => console.log(data.toString()))
    prismaDeploy.stderr.on('data', (data) => console.error(data.toString()))

    prismaDeploy.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
