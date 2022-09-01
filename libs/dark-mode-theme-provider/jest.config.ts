/* eslint-disable */
export default {
  displayName: 'dark-mode-theme-provider',

  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/dark-mode-theme-provider',
  preset: '../../jest.preset.js',
}
