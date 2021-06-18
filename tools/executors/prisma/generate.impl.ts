import { spawn } from 'child_process'
import { join } from 'path'

import { ExecutorContext } from '@nrwl/devkit'

import { GenerateOptions } from './generate'

export default async function (options: GenerateOptions, context: ExecutorContext): Promise<{ success: boolean }> {
  const schemaPath = join(context.workspace.projects[context.projectName].sourceRoot, options.schema)
  const args: string[] = ['prisma', 'generate', '--schema', schemaPath]
  const prismaGenerate = spawn('yarn', args)

  return new Promise((resolve) => {
    prismaGenerate.stdout.on('data', (data) => console.log(data.toString()))
    prismaGenerate.stderr.on('data', (data) => console.error(data.toString()))

    prismaGenerate.on('close', (code) => {
      resolve({ success: code === 0 })
    })
  })
}
