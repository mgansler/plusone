import { spawn } from 'child_process'
import { join } from 'path'

import { ExecutorContext } from '@nrwl/devkit'

import { FormatOptions } from './format'

export default async function (options: FormatOptions, context: ExecutorContext): Promise<{ success: boolean }> {
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
