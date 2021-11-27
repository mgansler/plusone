/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  cacheDirectory: '../../tmp/my-remix-app/.cache',
  // TODO: figure out how to move this into /dist
  // assetsBuildDirectory: "../../dist/apps/my-remix-app/public/build",
  // browserBuildDirectory: "../../dist/apps/my-remix-app/public/build",
  browserBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: '../../dist/apps/my-remix-app/build',
  devServerPort: 8002,
}
