/* eslint-disable */
export default {
  displayName: 'plugins-nx-cypress-ct',

  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/plugins/nx-cypress-ct',
  preset: '../../../jest.preset.js',
}
