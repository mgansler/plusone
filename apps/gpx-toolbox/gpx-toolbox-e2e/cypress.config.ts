import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

import { resetDatabase } from './src/support/database'
import { startStravaMock } from './src/support/strava-mock'

// Not the port of the dev backend (3333), so a running dev server is never reused with its database
const PORT = 3433
const STRAVA_MOCK_PORT = 3434

// Set explicitly, as CI/CD variables and the backend's .local.env/.env.local would otherwise take precedence
const backendEnv = [
  `PORT=${PORT}`,
  'GPX_TOOLBOX_DATABASE_URL=file:./gpx-toolbox-e2e.db',
  `STRAVA_BASE_URL=http://localhost:${STRAVA_MOCK_PORT}`,
  'STRAVA_CLIENT_ID=e2e-client',
  'STRAVA_CLIENT_SECRET=e2e-secret',
  `STRAVA_REDIRECT_URI=http://localhost:${PORT}/api/auth/strava/callback`,
  `FRONTEND_URL=http://localhost:${PORT}`,
  'JWT_SECRET=e2e-jwt-secret',
].join(' ')

const preset = nxE2EPreset(__filename, {
  webServerCommands: {
    default: `${backendEnv} npx nx run gpx-toolbox-backend:serve:production`,
    production: `${backendEnv} npx nx run gpx-toolbox-backend:serve:production`,
  },
  cypressDir: 'src',
  bundler: 'vite',
})

export default defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../../../reports/e2e/gpx-toolbox-[hash].xml',
    testCaseSwitchClassnameAndName: true,
  },
  e2e: {
    ...preset,
    baseUrl: `http://localhost:${PORT}`,
    // Next to the screenshots and videos of the preset instead of inside the project
    downloadsFolder: '../../../dist/cypress/apps/gpx-toolbox/gpx-toolbox-e2e/downloads',
    viewportWidth: 1280,
    viewportHeight: 800,
    async setupNodeEvents(on, config) {
      await startStravaMock(STRAVA_MOCK_PORT)
      on('task', { 'db:reset': resetDatabase })
      return preset.setupNodeEvents(on, config)
    },
  },
  retries: 2,
})
