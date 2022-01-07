import { checkFilesExist, ensureNxProject, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing'

describe('plugins-nx-remix e2e', () => {
  it('should create plugins-nx-remix', async () => {
    const uniqAppName = uniq('plugins-nx-remix')
    ensureNxProject('@mgansler/nx-remix', 'dist/libs/plugins/nx-remix')
    await runNxCommandAsync(`generate @mgansler/nx-remix:application ${uniqAppName}`)

    const result = await runNxCommandAsync(`build ${uniqAppName}`)
    expect(result.stdout).toContain(`Successfully built '${uniqAppName}'`)
  }, 120000)

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const uniqAppName = uniq('plugins-nx-remix')
      ensureNxProject('@mgansler/nx-remix', 'dist/libs/plugins/nx-remix')
      await runNxCommandAsync(`generate @mgansler/nx-remix:application ${uniqAppName} --directory subdir`)
      expect(() => checkFilesExist(`apps/subdir/${uniqAppName}/remix.config.js`)).not.toThrow()
    }, 120000)
  })

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const uniqAppName = uniq('plugins-nx-remix')
      ensureNxProject('@mgansler/nx-remix', 'dist/libs/plugins/nx-remix')
      await runNxCommandAsync(`generate @mgansler/nx-remix:application ${uniqAppName} --tags e2etag,e2ePackage`)
      const project = readJson(`apps/${uniqAppName}/project.json`)
      expect(project.tags).toEqual(['e2etag', 'e2ePackage'])
    }, 120000)
  })
})
