import type { Tree } from '@nx/devkit'
import { Linter, lintProjectGenerator } from '@nx/linter'

import type { NormalizedSchema } from './normalize-options'

export async function addLintTask(tree: Tree, normalizedOptions: NormalizedSchema) {
  return await lintProjectGenerator(tree, {
    eslintFilePatterns: [`${normalizedOptions.projectRoot}/**/*.{ts,tsx,js,jsx}`],
    linter: Linter.EsLint,
    project: normalizedOptions.projectName,
    setParserOptionsProject: false,
    skipFormat: true,
    tsConfigPaths: [],
  })
}
