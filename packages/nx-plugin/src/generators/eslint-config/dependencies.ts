import { type Tree, joinPathFragments } from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'

/**
 * Dependencies required for the standard ESLint configuration.
 */
export const ESLINT_DEPENDENCIES: string[] = [
  '@the-stranger/eslint-config',
  '@nx/eslint-plugin',
  'eslint',
]

export function addEslintDependencies(tree: Tree, options: EslintDependencyOptions) {
  addDependenciesToProject(tree, [], ESLINT_DEPENDENCIES, packageJsonPath(options.root))
}

export interface EslintDependencyOptions {
  root: string
}

function packageJsonPath(root: string) {
  return root === '.' ? 'package.json' : joinPathFragments(root, 'package.json')
}
