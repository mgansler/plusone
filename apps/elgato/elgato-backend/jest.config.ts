import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  displayName: 'elgato-backend',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(until-async|rettime|msw|@open-draft/deferred-promise|tslib))'],
  transform: {
    '^.+\\.mjs$': ['babel-jest', { configFile: path.resolve(__dirname, '../../../babel-jest.config.json') }],
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'mjs', 'html'],
  coverageDirectory: '../../../coverage/apps/elgato/elgato-backend',
  coveragePathIgnorePatterns: ['src/stubs/*'],
}
