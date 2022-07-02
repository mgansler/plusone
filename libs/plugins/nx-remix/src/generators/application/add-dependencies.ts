import type { Tree } from '@nrwl/devkit'
import { addDependenciesToPackageJson, updateJson } from '@nrwl/devkit'

type PackageJson = {
  scripts: {
    postinstall?: string
  }
}

export function addDependencies(tree: Tree) {
  addDependenciesToPackageJson(
    tree,
    {
      '@remix-run/react': '1.6.3',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      remix: '1.6.3',
    },
    {
      '@remix-run/dev': '1.6.3',
      '@remix-run/serve': '1.6.3',
      '@types/react': '^18.0.14',
      '@types/react-dom': '^18.0.5',
      typescript: '^4.7.4',
    },
  )

  updateJson<PackageJson, PackageJson>(tree, 'package.json', (value) => {
    value.scripts.postinstall = 'remix setup node'
    return value
  })
}
