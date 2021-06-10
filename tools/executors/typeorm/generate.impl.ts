import { spawn } from 'child_process'
import { join } from 'path'

import { ExecutorContext } from '@nrwl/devkit'

import { GenerateOptions } from './generate'

export default async function (options: GenerateOptions, context: ExecutorContext) {
  const projectRoot = context.workspace.projects[context.projectName].root
  const projectSourceRoot = context.workspace.projects[context.projectName].sourceRoot

  const args = [
    '-P',
    join(projectRoot, 'tsconfig.lib.json'),
    '-r',
    'tsconfig-paths/register',
    'node_modules/typeorm/cli.js',
    '--config',
    join(projectSourceRoot, options.ormConfig),
    'migration:generate',
    '-n',
    options.name,
  ]

  const generate = spawn('ts-node', args)

  return new Promise<{ success: boolean }>((resolve) => {
    generate.stdout.on('data', (data) => console.log(data.toString()))
    generate.stderr.on('data', (data) => console.error(data.toString()))

    generate.on('close', (code) => {
      if (code !== 0) {
        resolve({ success: false })
      }
      const format = spawn('yarn', ['prettier', '--write', `${projectSourceRoot}/_migrations_/*.ts`])
      format.on('close', (code) => {
        resolve({ success: code === 0 })
      })
    })
  })
}
