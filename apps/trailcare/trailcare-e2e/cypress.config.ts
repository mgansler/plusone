import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

const adminPassword = 'e2e-admin'
const crewPassword = 'e2e-crew'
// Not the dev server port (3105): @nx/cypress reuses a server that is already running on the base URL,
// which would run the tests against the dev database and its passwords.
const port = 3205

// Set explicitly, as protected CI/CD variables on main would otherwise take precedence over .local.env.
// Not as a prefix of the web server command, as @nx/cypress then no longer infers the task and disables parallelism.
process.env.TRAILCARE_ADMIN_PASSWORD = adminPassword
process.env.TRAILCARE_INITIAL_ACCESS_PASSWORD = crewPassword
process.env.PORT = String(port)

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
    baseUrl: `http://localhost:${port}`,
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
