import { nxComponentTestingPreset } from '@nx/react/plugins/component-testing'
import { defineConfig } from 'cypress'

export default defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/component-test/stgtrails-web-[hash].xml',
    testCaseSwitchClassnameAndName: true,
  },
  component: nxComponentTestingPreset(__filename, { bundler: 'vite' }),
})
