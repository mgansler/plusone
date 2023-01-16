import { nxComponentTestingPreset } from '@nrwl/react/plugins/component-testing'
import { defineConfig } from 'cypress'

export default defineConfig({
  component: nxComponentTestingPreset(__filename, {
    bundler: 'vite',
  }) as Cypress.ConfigOptions['component'],
})
