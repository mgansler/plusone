import { checkFilesExist, ensureNxProject, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing'
describe('plugins-nx-compose e2e', () => {
  it('should create plugins-nx-compose', async () => {
    const plugin = uniq('plugins-nx-compose')
    ensureNxProject('@plusone/nx-compose', 'dist/libs/plugins/nx-compose')
    await runNxCommandAsync(`generate @plusone/nx-compose:plugins-nx-compose ${plugin}`)

    const result = await runNxCommandAsync(`build ${plugin}`)
    expect(result.stdout).toContain('Executor ran')
  }, 120000)

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const plugin = uniq('plugins-nx-compose')
      ensureNxProject('@plusone/nx-compose', 'dist/libs/plugins/nx-compose')
      await runNxCommandAsync(`generate @plusone/nx-compose:plugins-nx-compose ${plugin} --directory subdir`)
      expect(() => checkFilesExist(`libs/subdir/${plugin}/src/index.ts`)).not.toThrow()
    }, 120000)
  })

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const plugin = uniq('plugins-nx-compose')
      ensureNxProject('@plusone/nx-compose', 'dist/libs/plugins/nx-compose')
      await runNxCommandAsync(`generate @plusone/nx-compose:plugins-nx-compose ${plugin} --tags e2etag,e2ePackage`)
      const project = readJson(`libs/${plugin}/project.json`)
      expect(project.tags).toEqual(['e2etag', 'e2ePackage'])
    }, 120000)
  })
})
