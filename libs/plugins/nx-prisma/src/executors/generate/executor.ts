import { spawn } from 'child_process'
import { resolve } from 'path'

import type { ExecutorContext } from '@nrwl/tao/src/shared/workspace'

import type { BuildExecutorSchema } from './schema'

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  if (!context.projectName) {
    return { success: false }
  }

  const schemaPath = resolve(context.workspace.projects[context.projectName].sourceRoot, options.schema)
  const args = ['prisma', 'generate', '--schema', schemaPath]
  const prismaGenerate = spawn('yarn', args)

  return new Promise((resolve) => {
    prismaGenerate.stdout.on('data', (data) => console.log(data.toString()))
    prismaGenerate.stderr.on('data', (data) => console.error(data.toString()))

    prismaGenerate.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
