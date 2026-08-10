import { type Tree, joinPathFragments } from '@nx/devkit'

import type { LibrarySchema } from './schema'

import { addDependenciesToProject } from '../../lib/add-dependencies'

export function addDependencies(tree: Tree, config: DependencyConfig) {
  const pkg = joinPathFragments(config.directory, 'package.json')

  const deps = ['typescript']

  addDependenciesToProject(tree, [], deps, pkg)
}

export interface DependencyConfig extends LibrarySchema {
  directory: string
}
