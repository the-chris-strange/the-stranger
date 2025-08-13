import { joinPathFragments, Tree } from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'
import { NormalizedSchema } from './options'

export function addLibDependencies(tree: Tree, config: DependencyConfig) {
  const deps = ['typescript']

  addDependenciesToProject(
    tree,
    [],
    deps,
    joinPathFragments(config.directory, 'package.json'),
  )
}

export interface DependencyConfig extends NormalizedSchema {
  directory: string
}
