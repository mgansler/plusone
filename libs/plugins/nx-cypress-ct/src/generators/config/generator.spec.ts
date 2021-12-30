import type { Tree } from '@nrwl/devkit'
import { readProjectConfiguration } from '@nrwl/devkit'
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing'
import { Linter } from '@nrwl/linter'
import { applicationGenerator } from '@nrwl/react'

import generator from './generator'
import type { ConfigSchema } from './schema'

jest.mock('./add-dependencies')

describe('plugins-nx-cypress-ct generator', () => {
  let appTree: Tree
  const options: ConfigSchema = { projectName: 'test', video: false }

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace()
    await applicationGenerator(appTree, {
      e2eTestRunner: 'none',
      linter: Linter.EsLint,
      skipFormat: false,
      style: 'none',
      unitTestRunner: 'none',
      name: options.projectName,
    })
  })

  it('should run successfully', async () => {
    await generator(appTree, options)
    const config = readProjectConfiguration(appTree, options.projectName)

    expect(config.targets['ct']).toBeDefined()
  })
})
