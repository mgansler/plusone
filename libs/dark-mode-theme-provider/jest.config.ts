export default {
  displayName: 'dark-mode-theme-provider',

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/dark-mode-theme-provider',
  preset: '../../jest.preset.js',
}
