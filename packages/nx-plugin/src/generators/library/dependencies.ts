import { joinPathFragments, type Tree } from '@nx/devkit'

import type { NormalizedSchema } from './options'

import { addDependenciesToProject } from '../../lib/add-dependencies'

export function addDependencies(tree: Tree, config: DependencyConfig) {
  const pkg = joinPathFragments(config.directory, 'package.json')

  const deps = ['typescript']

  addDependenciesToProject(tree, [], deps, pkg)
}

export interface DependencyConfig extends NormalizedSchema {
  directory: string
}
