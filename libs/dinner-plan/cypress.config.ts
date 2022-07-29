import { join } from 'path'

import { getWebpackConfig } from '@nrwl/cypress/plugins/preprocessor'
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    video: false,
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: getWebpackConfig({
        env: {
          tsConfig: join(__dirname, 'tsconfig.cy.json'),
        },
      }),
    },
  },
})
