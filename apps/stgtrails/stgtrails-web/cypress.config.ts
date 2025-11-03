import { nxComponentTestingPreset } from '@nx/react/plugins/component-testing'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  viewportWidth: 1920,
  viewportHeight: 1080,
  reporterOptions: {
    mochaFile: '../../../reports/component-test/stgtrails-web-[hash].xml',
  },
  component: nxComponentTestingPreset(__filename, { bundler: 'vite' }),
})
