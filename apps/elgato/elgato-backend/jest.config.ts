export default {
  displayName: 'elgato-backend',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(until-async))'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/elgato/elgato-backend',
  coveragePathIgnorePatterns: ['src/stubs/*'],
}
