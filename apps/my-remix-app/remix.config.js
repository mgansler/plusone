/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  // TODO: figure out how to move this into /dist
  // cacheDirectory: '../../tmp/my-remix-app/.cache',
  // assetsBuildDirectory: "../../dist/apps/my-remix-app/public/build",
  // browserBuildDirectory: "../../dist/apps/my-remix-app/public/build",
  // serverBuildDirectory: '../../dist/apps/my-remix-app/build',
  browserBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: 'build',
  devServerPort: 8002,
}
