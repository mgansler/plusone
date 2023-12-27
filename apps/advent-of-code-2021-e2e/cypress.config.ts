import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../reports/e2e/advent-of-code-2021-[hash].xml',
  },
  e2e: {
    ...nxE2EPreset(__dirname),
    experimentalRunAllSpecs: true,
    retries: 3,
  },
})
