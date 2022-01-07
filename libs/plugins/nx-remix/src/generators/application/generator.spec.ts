import type { Tree } from '@nrwl/devkit'
import { readProjectConfiguration } from '@nrwl/devkit'
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing'

import generator from './generator'
import type { ApplicationGeneratorSchema } from './schema'

jest.mock('./add-dependencies')

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
