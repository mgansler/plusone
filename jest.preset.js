const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  testEnvironment: 'jsdom',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/test',
        outputName: `test-${process.env.NX_TASK_HASH}.xml`,
      },
    ],
  ],
}
