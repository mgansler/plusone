module.exports = {
  displayName: 'github-hooks',

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/github-hooks',
  preset: '../../jest.preset.ts',
}
