module.exports = {
  displayName: 'feeds-web-shared',

  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/feeds/web/shared',
  preset: '../../../../jest.preset.ts',
}
