/* eslint-disable */
export default {
  displayName: 'feeds-web-new-feed',

  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/feeds/web/new-feed',
  preset: '../../../../jest.preset.js',
}
