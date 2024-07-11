import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/e2e/feeds-[hash].xml',
  },
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'src', bundler: 'vite' }),
    baseUrl: 'http://localhost:4102',
    experimentalRunAllSpecs: true,
  },
})
