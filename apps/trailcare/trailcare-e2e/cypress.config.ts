import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

const adminPassword = 'e2e-admin'
const crewPassword = 'e2e-crew'

// Set explicitly, as protected CI/CD variables on main would otherwise take precedence over .local.env
const backendEnv = `TRAILCARE_ADMIN_PASSWORD=${adminPassword} TRAILCARE_INITIAL_ACCESS_PASSWORD=${crewPassword}`

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/e2e/trailcare-[hash].xml',
    testCaseSwitchClassnameAndName: true,
  },
  e2e: {
    ...nxE2EPreset(__filename, {
      webServerCommands: {
        default: `${backendEnv} npx nx run trailcare-backend:serve:production`,
        production: `${backendEnv} npx nx run trailcare-backend:serve:production`,
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
    adminPassword,
    crewPassword,
  },
  retries: 2,
})
