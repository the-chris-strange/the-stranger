import { joinPathFragments, ProjectConfiguration, Tree } from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'
import { detectConfig } from '../../lib/detect-config'

/**
 * Dependencies required for the standard ESLint configuration.
 */
export const ESLINT_DEPENDENCIES: string[] = [
  '@eslint/js',
  '@nx/eslint',
  '@nx/eslint-plugin',
  '@typescript-eslint/parser',
  '@typescript-eslint/utils',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-jsdoc',
  'eslint-plugin-perfectionist',
  'eslint-plugin-unicorn',
  'jsonc-eslint-parser',
  'typescript-eslint',
]

/**
 * Dependencies added if the project uses [Jest](https://jestjs.io).
 */
export const JEST_DEPENDENCIES: string[] = ['eslint-plugin-jest']

/**
 * Dependencies added if the project uses [Vitest](https://vitest.dev).
 */
export const VITEST_DEPENDENCIES: string[] = ['@vitest/eslint-plugin']

export function addEslintDependencies(tree: Tree, options: EslintDependencyOptions) {
  const { root, unitTestRunner } = options
  const deps = [...ESLINT_DEPENDENCIES]

  // Check jest first, since vitest may be implied by presence of 'vite.config.m?ts'
  if (unitTestRunner === 'jest' || detectConfig(tree, 'jest', root)) {
    deps.push(...JEST_DEPENDENCIES)
  } else if (unitTestRunner === 'vitest' || detectConfig(tree, 'vitest', root)) {
    deps.push(...VITEST_DEPENDENCIES)
  }

  addDependenciesToProject(tree, [], deps, joinPathFragments(root, 'package.json'))
}

export interface EslintDependencyOptions extends ProjectConfiguration {
  unitTestRunner?: 'jest' | 'vitest'
}
