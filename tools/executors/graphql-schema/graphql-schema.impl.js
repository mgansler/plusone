'use strict'
exports.__esModule = true
var path = require('path')
var child_process_1 = require('child_process')
function default_1(schema, context) {
  var projectRoot = context.workspace.projects[context.projectName].root
  var projectSourceRoot =
    context.workspace.projects[context.projectName].sourceRoot
  var configFilePath = path.join(projectRoot, schema.config)
  var graphqlCodegen = child_process_1.spawn('graphql-codegen', [
    '--config',
    configFilePath,
  ])
  return new Promise(function (resolve) {
    graphqlCodegen.on('close', function (code) {
      if (code !== 0) {
        resolve({ success: false })
      }
      var format = child_process_1.spawn('yarn', [
        'prettier',
        '--write',
        projectSourceRoot,
      ])
      format.on('close', function (code) {
        resolve({ success: code === 0 })
      })
    })
  })
}
exports['default'] = default_1
