import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'process'

import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import { INestApplication, Logger } from '@nestjs/common'

export const GLOBAL_PREFIX = 'api'

export function setupApi(app: INestApplication): OpenAPIObject {
  app.setGlobalPrefix(GLOBAL_PREFIX)

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GPX-Toolcat API')
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)

  // Apply Swagger UI with OAuth2 token input
  SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
    customSiteTitle: 'GPX-Toolcat API',
    // Inject custom CSS to add a token input field
    customCss: `
      .swagger-ui .topbar { display: none; }
      .auth-wrapper { margin: 16px 0; }
    `,
  })

  // Inject Swagger UI OAuth2 token helper script
  const swaggerInitPath = resolve(__dirname, 'web', 'swagger-init.js')
  try {
    writeFileSync(
      swaggerInitPath,
      `
// Custom Swagger UI initialization — adds JWT token management
(function () {
  const TOKEN_KEY = 'gpx-toolbox-jwt'

  // Listen for changes in the Swagger UI authorize input
  const observer = new MutationObserver(function () {
    const authBtn = document.querySelector('.auth-btn-authorize')
    if (authBtn && !authBtn.dataset.listenerAdded) {
      authBtn.dataset.listenerAdded = 'true'
      authBtn.addEventListener('click', function () {
        const input = document.querySelector('#authorize-input')
        if (input) {
          const token = localStorage.getItem(TOKEN_KEY)
          if (token) {
            input.value = 'Bearer ' + token
          }
        }
      })
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // Auto-authorize if token is in localStorage
  setTimeout(function () {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      const authBtn = document.querySelector('.auth-btn-authorize')
      if (authBtn && authBtn.textContent.includes('Authorize')) {
        authBtn.click()
        setTimeout(function () {
          const input = document.querySelector('#authorize-input')
          if (input) {
            input.value = 'Bearer ' + token
            const applyBtn = document.querySelector('.authorize')
            if (applyBtn) applyBtn.click()
          }
        }, 100)
      }
    }
  }, 500)
})()
  `.trim(),
      { encoding: 'utf-8' },
    )
    Logger.log('Swagger UI init script written.')
  } catch {
    // Swagger init script is optional — ignore if write fails
  }

  return document
}

export function writeApiSpec(document: OpenAPIObject) {
  const outputPath = resolve(process.cwd(), 'apps/gpx-toolbox/gpx-toolbox-backend', 'gpx-toolbox-internal.json')
  writeFileSync(outputPath, JSON.stringify(document, undefined, 2), { encoding: 'utf-8' })
  Logger.log('OpenAPI spec has been written.')
}
