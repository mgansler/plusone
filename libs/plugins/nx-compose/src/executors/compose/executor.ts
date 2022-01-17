import type { ComposeExecutorSchema } from './schema'

export default async function runExecutor(options: ComposeExecutorSchema) {
  console.log('Executor ran for Build', options)
  return {
    success: true,
  }
}
