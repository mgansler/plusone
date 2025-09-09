export default {
  displayName: 'stgtrails-backend',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: ['node_modules/(?!(uuid))'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/stgtrails/stgtrails-backend',
}
