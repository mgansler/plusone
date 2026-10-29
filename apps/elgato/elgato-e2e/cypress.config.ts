import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/e2e/elgato-[hash].xml',
    testCaseSwitchClassnameAndName: true,
  },
  e2e: {
    ...nxE2EPreset(__filename, {
      webServerCommands: { default: 'npx nx run elgato-web:serve-static' },
      cypressDir: 'src',
      bundler: 'vite',
    }),
  },
  retries: 2,
})
