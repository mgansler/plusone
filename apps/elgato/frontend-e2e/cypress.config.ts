import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/e2e/elgato.xml',
  },
  e2e: nxE2EPreset(__dirname, {
    bundler: 'vite',
  }),
})
