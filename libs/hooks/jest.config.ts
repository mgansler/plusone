/* eslint-disable */
export default {
  displayName: 'hooks',

  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { cwd: __dirname, configFile: '../../babel-jest.config.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/hooks',
  preset: '../../jest.preset.js',
}
