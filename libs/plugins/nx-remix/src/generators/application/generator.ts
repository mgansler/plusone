import * as path from 'path'

import type { Tree } from '@nrwl/devkit'
import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
} from '@nrwl/devkit'
import { Linter, lintProjectGenerator } from '@nrwl/linter'
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial'

export interface ApplicationGeneratorSchema {
  name: string
  tags?: string
  directory?: string
}

interface NormalizedSchema extends ApplicationGeneratorSchema {
  projectName: string
  projectRoot: string
  projectDirectory: string
  parsedTags: string[]
}

function normalizeOptions(tree: Tree, options: ApplicationGeneratorSchema): NormalizedSchema {
  const name = names(options.name).fileName
  const projectDirectory = options.directory ? `${names(options.directory).fileName}/${name}` : name
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-')
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`
  const parsedTags = options.tags ? options.tags.split(',').map((s) => s.trim()) : []

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  }
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  }
  generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions)
}

export default async function (tree: Tree, options: ApplicationGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options)
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/app`,
    targets: {
      build: {
        executor: '@mgansler/nx-remix:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}`,
        },
        configurations: {
          production: {},
        },
      },
      serve: {
        executor: '@mgansler/nx-remix:serve',
      },
    },
    tags: normalizedOptions.parsedTags,
  })

  const lintTask = await lintProjectGenerator(tree, {
    eslintFilePatterns: [`${normalizedOptions.projectRoot}/**/*.{ts,tsx,js,jsx}`],
    linter: Linter.EsLint,
    project: normalizedOptions.projectName,
    setParserOptionsProject: false,
    skipFormat: true,
    tsConfigPaths: [],
  })

  runTasksInSerial(lintTask)

  addFiles(tree, normalizedOptions)
  await formatFiles(tree)
}
