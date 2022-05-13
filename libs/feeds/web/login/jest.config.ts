export default {
  displayName: 'feeds-web-login',

  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { cwd: __dirname, configFile: '../../../../babel-jest.config.json' }],
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', 'whatwg-fetch'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/libs/feeds/web/login',
  preset: '../../../../jest.preset.js',
}
