export default {
  displayName: 'github-pipeline-status',

  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { cwd: __dirname, configFile: './babel-jest.config.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/github-pipeline-status',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  preset: '../../jest.preset.js',
}
