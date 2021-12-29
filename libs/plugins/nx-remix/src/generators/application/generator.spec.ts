import type { Tree } from '@nrwl/devkit'
import { readProjectConfiguration } from '@nrwl/devkit'
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing'

import type { ApplicationGeneratorSchema } from './generator'
import generator from './generator'

describe('application generator', () => {
  let appTree: Tree
  const options: ApplicationGeneratorSchema = { name: 'test' }

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await generator(appTree, options)
    const config = readProjectConfiguration(appTree, 'test')
    expect(config).toBeDefined()
  })
})
