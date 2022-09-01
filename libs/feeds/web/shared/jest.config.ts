/* eslint-disable */
export default {
  displayName: 'feeds-web-shared',

  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/feeds/web/shared',
  preset: '../../../../jest.preset.js',
}
