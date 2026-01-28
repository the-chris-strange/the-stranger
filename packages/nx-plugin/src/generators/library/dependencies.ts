import { joinPathFragments, Tree } from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'
import { NormalizedSchema } from './options'

export function addDependencies(tree: Tree, config: DependencyConfig) {
  const pkg = joinPathFragments(config.directory, 'package.json')

  const deps = ['typescript']

  addDependenciesToProject(tree, [], deps, pkg)
}

export interface DependencyConfig extends NormalizedSchema {
  directory: string
}
