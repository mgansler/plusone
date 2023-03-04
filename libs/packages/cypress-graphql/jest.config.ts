/* eslint-disable */
export default {
  displayName: 'packages-cypress-graphql',

  globals: {},
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/packages/cypress-graphql',
  preset: '../../../jest.preset.js',
}
