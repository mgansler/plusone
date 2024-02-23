import { nxComponentTestingPreset } from '@nx/react/plugins/component-testing'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../reports/component-test/dinner-plan-[hash].xml',
  },
  component: nxComponentTestingPreset(__filename, {
    bundler: 'vite',
  }) as Cypress.ConfigOptions['component'],
  experimentalMemoryManagement: true,
})
