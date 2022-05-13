const nxPreset = require('@nrwl/jest/preset').default

module.exports = {
  ...nxPreset,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/test',
        outputName: `test-${process.env.NX_TASK_TARGET_PROJECT}.xml`,
      },
    ],
  ],
}
