import { ensureNxProject, runNxCommandAsync, tmpProjPath, uniq } from '@nrwl/nx-plugin/testing'
import { writeFileSync } from 'fs'
import { join } from 'path'

function writeComponentSpec(name: string) {
  writeFileSync(
    join(tmpProjPath('libs'), name, 'src/lib', `${name}.ct.tsx`),
    `
import { mount } from '@cypress/react'
import Component from './${name}'

describe('Dummy', () => {
  it('should pass', () => {
    mount(<Component />)
    cy.findByRole('heading', {name: /Welcome to/})
  })
})
`,
  )
}

describe('plugins-nx-cypress-ct e2e', () => {
  it('should add and run ct', async () => {
    const plugin = uniq('plugins-nx-cypress-ct')
    ensureNxProject('@mgansler/nx-cypress-ct', 'dist/libs/plugins/nx-cypress-ct')
    await runNxCommandAsync(`generate @nrwl/react:library ${plugin}`)
    await runNxCommandAsync(`generate @mgansler/nx-cypress-ct:config ${plugin}`)
    writeComponentSpec(plugin)

    const result = await runNxCommandAsync(`ct ${plugin}`)
    expect(result.stdout).toContain('All specs passed!')
  }, 120000)
})
