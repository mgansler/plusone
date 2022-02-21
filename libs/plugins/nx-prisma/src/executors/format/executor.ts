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
  const args: string[] = ['prisma', 'format', '--schema', schemaPath]
  const prismaFormat = spawn('yarn', args)

  return new Promise((resolve) => {
    prismaFormat.stdout.on('data', (data) => console.log(data.toString()))
    prismaFormat.stderr.on('data', (data) => console.error(data.toString()))

    prismaFormat.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
