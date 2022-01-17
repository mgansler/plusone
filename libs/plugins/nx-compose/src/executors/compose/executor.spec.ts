import executor from './executor'
import type { ComposeExecutorSchema } from './schema'

const options: ComposeExecutorSchema = {}

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
