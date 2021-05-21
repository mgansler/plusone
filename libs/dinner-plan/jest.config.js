module.exports = {
  displayName: 'dinner-plan',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/dinner-plan',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
}
