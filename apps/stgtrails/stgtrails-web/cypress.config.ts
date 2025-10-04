import { nxComponentTestingPreset } from '@nx/react/plugins/component-testing'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/component-test/stgtrails-web-[hash].xml',
  },
  component: nxComponentTestingPreset(__filename, { bundler: 'vite' }),
})
