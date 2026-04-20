import type { Tree } from '@nx/devkit'

import type { JestConfigSchema } from './schema'

import { addDependenciesToProject } from '../../lib/add-dependencies'

export function addDependencies(tree: Tree, options: JestConfigSchema, pkg: string) {
  const deps = ['nx', '@nx/jest', 'jest', 'ts-jest']

  if (!options.globals) {
    deps.push('@jest/globals')
  }

  addDependenciesToProject(tree, [], deps, pkg)
}
