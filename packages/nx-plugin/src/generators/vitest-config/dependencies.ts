import type { Tree } from '@nx/devkit'

import type { VitestConfigSchema } from './schema'

import { addDependenciesToProject } from '../../lib/add-dependencies'

export function addDependencies(tree: Tree, _options: VitestConfigSchema, pkg: string) {
  addDependenciesToProject(
    tree,
    [],
    ['nx', '@nx/vitest', '@vitest/coverage-v8', 'vitest'],
    pkg,
  )
}
