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
      '@remix-run/react': '1.1.1',
      react: '^17.0.2',
      'react-dom': '^17.0.2',
      remix: '1.1.1',
    },
    {
      '@remix-run/dev': '1.1.1',
      '@remix-run/serve': '1.1.1',
      '@types/react': '^17.0.24',
      '@types/react-dom': '^17.0.9',
      typescript: '^4.1.2',
    },
  )

  updateJson<PackageJson, PackageJson>(tree, 'package.json', (value) => {
    value.scripts.postinstall = 'remix setup node'
    return value
  })
}
