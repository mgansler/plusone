const nxPreset = require('@nx/jest/preset').default

module.exports = {
  ...nxPreset,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/test',
        outputName: `${process.env.NX_TASK_TARGET_PROJECT}.xml`,
      },
    ],
  ],
  coverageReporters: ['html', 'clover', 'json', 'cobertura'],
}
