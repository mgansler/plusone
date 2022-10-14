import { spawn } from 'child_process'
import { join } from 'path'

import type { ExecutorContext } from '@nrwl/devkit'

import type { FormatExecutorSchema } from './schema'

export default async function runExecutor(
  options: FormatExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const schemaPath = join(context.workspace.projects[context.projectName].sourceRoot, options.schema)
  const args: string[] = ['prisma', 'db', 'push', '--schema', schemaPath]
  const prismaPush = spawn('yarn', args)

  return new Promise((resolve) => {
    prismaPush.stdout.on('data', (data) => console.log(data.toString()))
    prismaPush.stderr.on('data', (data) => console.error(data.toString()))

    prismaPush.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
