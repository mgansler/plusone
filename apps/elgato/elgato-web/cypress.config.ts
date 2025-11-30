import { nxComponentTestingPreset } from '@nx/react/plugins/component-testing'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/component-test/elgato-web-[hash].xml',
    testCaseSwitchClassnameAndName: true,
  },
  component: nxComponentTestingPreset(__filename, { bundler: 'vite' }),
  experimentalMemoryManagement: true,
})
