import { Tree } from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'
import { ViteConfigSchema } from './schema'

export function addDependencies(tree: Tree, options: ViteConfigSchema, pkg: string) {
  const deps = ['nx']
  if (options.includeBuild) {
    deps.push('@nx/vite', 'vite', 'vite-plugin-dts')
  }
  if (options.includeTest) {
    deps.push('@nx/vitest', '@vitest/coverage-v8', 'vitest')
  }
  if (options.react) {
    deps.push('vite-plugin-react')
    if (options.swc) {
      deps.push('vite-plugin-react-swc')
    }
  }

  addDependenciesToProject(tree, [], deps, pkg)
}
