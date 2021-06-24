module.exports = {
  displayName: 'feeds-web-user-view',
  preset: '../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', 'whatwg-fetch'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/feeds/web/user-view',
}
