import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/e2e/trailcare-[hash].xml',
    testCaseSwitchClassnameAndName: true,
  },
  e2e: {
    ...nxE2EPreset(__filename, {
      webServerCommands: {
        default: 'npx nx run trailcare-backend:serve:production',
        production: 'npx nx run trailcare-backend:serve:production',
      },
      cypressDir: 'src',
      bundler: 'vite',
    }),
    baseUrl: 'http://localhost:3105',
    // Trail crews use the app on their phones
    viewportWidth: 390,
    viewportHeight: 844,
  },
  expose: {
    adminPassword: 'e2e-admin',
    crewPassword: 'e2e-crew',
  },
  retries: 2,
})
