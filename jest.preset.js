const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
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
