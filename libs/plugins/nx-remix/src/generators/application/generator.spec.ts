import type { Tree } from '@nx/devkit'
import { readProjectConfiguration } from '@nx/devkit'
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing'

import generator from './generator'
import type { ApplicationGeneratorSchema } from './schema'

jest.mock('./add-dependencies')

describe('application generator', () => {
  let appTree: Tree
  const options: ApplicationGeneratorSchema = { name: 'test', express: false }

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace()
  })

  it('should run successfully', async () => {
    await generator(appTree, options)
    const config = readProjectConfiguration(appTree, 'test')
    expect(config).toBeDefined()
  })
})
