import { checkFilesExist, ensureNxProject, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing'
describe('plugins-nx-remix e2e', () => {
  it('should create plugins-nx-remix', async () => {
    const plugin = uniq('plugins-nx-remix')
    ensureNxProject('@plusone/nx-remix', 'dist/libs/plugins/nx-remix')
    await runNxCommandAsync(`generate @plusone/nx-remix:plugins-nx-remix ${plugin}`)

    const result = await runNxCommandAsync(`build ${plugin}`)
    expect(result.stdout).toContain('Executor ran')
  }, 120000)

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('plugins-nx-remix')
      ensureNxProject('@plusone/nx-remix', 'dist/libs/plugins/nx-remix')
      await runNxCommandAsync(`generate @plusone/nx-remix:plugins-nx-remix ${plugin} --directory subdir`)
      expect(() => checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)).not.toThrow()
    }, 120000)
  })

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const plugin = uniq('plugins-nx-remix')
      ensureNxProject('@plusone/nx-remix', 'dist/libs/plugins/nx-remix')
      await runNxCommandAsync(`generate @plusone/nx-remix:plugins-nx-remix ${plugin} --tags e2etag,e2ePackage`)
      const project = readJson(`libs/${plugin}/project.json`)
      expect(project.tags).toEqual(['e2etag', 'e2ePackage'])
    }, 120000)
  })
})
