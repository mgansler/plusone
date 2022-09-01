/* eslint-disable */
export default {
  displayName: 'github-hooks',

  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/github-hooks',
  preset: '../../jest.preset.js',
}
