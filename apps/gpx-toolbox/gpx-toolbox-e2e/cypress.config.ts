import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

import { resetDatabase } from './src/support/database'
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  resetGoogleMock,
  setGoogleUser,
  startGoogleMock,
} from './src/support/google-mock'

// Not the port of the dev backend (3333), so a running dev server is never reused with its database
const PORT = 3433
const GOOGLE_MOCK_PORT = 3435

// Set explicitly, as CI/CD variables and the backend's .local.env/.env.local would otherwise take precedence.
// Not as a prefix of the web server command, as @nx/cypress then no longer infers the task and disables parallelism.
Object.assign(process.env, {
  PORT: `${PORT}`,
  GPX_TOOLBOX_DATABASE_URL: 'file:./gpx-toolbox-e2e.db',
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: `http://localhost:${PORT}/api/auth/google/callback`,
  GOOGLE_DISCOVERY_URL: `http://localhost:${GOOGLE_MOCK_PORT}/.well-known/openid-configuration`,
  FRONTEND_URL: `http://localhost:${PORT}`,
  JWT_SECRET: 'e2e-jwt-secret',
})

const preset = nxE2EPreset(__filename, {
  webServerCommands: {
    default: 'npx nx run gpx-toolbox-backend:serve:production',
    production: 'npx nx run gpx-toolbox-backend:serve:production',
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
      await startGoogleMock(GOOGLE_MOCK_PORT)
      on('task', {
        'db:reset': () => {
          resetGoogleMock()
          return resetDatabase()
        },
        'google:user': setGoogleUser,
      })
      return preset.setupNodeEvents(on, config)
    },
  },
  retries: 2,
})
