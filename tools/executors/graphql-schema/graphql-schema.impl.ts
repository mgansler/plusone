import { ExecutorContext, Tree } from '@nrwl/devkit'
import path = require('path')
import { spawn } from 'child_process'

interface Schema {
  config: string
}

export default function (schema: Schema, context: ExecutorContext): Promise<{ success: boolean }> {
  const projectRoot = context.workspace.projects[context.projectName].root
  const projectSourceRoot = context.workspace.projects[context.projectName].sourceRoot
  const configFilePath = path.join(projectRoot, schema.config)

  const graphqlCodegen = spawn('graphql-codegen', ['--config', configFilePath])

  return new Promise<{ success: boolean }>((resolve) => {
    graphqlCodegen.stdout.on('data', (data) => console.log(data.toString()))
    graphqlCodegen.stderr.on('data', (data) => console.error(data.toString()))

    graphqlCodegen.on('close', (code) => {
      if (code !== 0) {
        resolve({ success: false })
      }
      const format = spawn('yarn', ['prettier', '--write', projectSourceRoot])
      format.on('close', (code) => {
        resolve({ success: code === 0 })
      })
    })
  })
}
