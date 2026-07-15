import type { Tree } from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { addDependenciesToProject } from '../../lib/add-dependencies'

export function addDependencies(tree: Tree, options: VitestConfigSchema, pkg: string) {
  const dependencies: string[] = ['nx', '@nx/vitest', 'vitest']

  if (options.coverageProvider === 'v8') {
    dependencies.push('@vitest/coverage-v8')
  }

  addDependenciesToProject(tree, [], dependencies, pkg)
}
