// FIXME: remove custom config when prisma upgrades undici to v4
module.exports = (config, context) => {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [...config.module.rules],
    },
    externals: [
      ...config.externals,
      // https://github.com/prisma/prisma/issues/6899
      '_http_common',
    ],
  }
}
