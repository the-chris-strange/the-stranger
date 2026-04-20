import { joinPathFragments, type ProjectConfiguration, type Tree } from '@nx/devkit'

import { addDependenciesToProject } from '../../lib/add-dependencies'
import { detectConfig } from '../../lib/detect-config'

/**
 * Dependencies required for the standard ESLint configuration.
 */
export const ESLINT_DEPENDENCIES: string[] = [
  '@nx/eslint-plugin',
  '@nx/eslint',
  '@typescript-eslint/parser',
  'eslint-config-prettier',
  'eslint-plugin-jsdoc',
  'eslint-plugin-n',
  'eslint-plugin-perfectionist',
  'eslint-plugin-promise',
  'eslint-plugin-regexp',
  'eslint-plugin-unicorn',
  'eslint-plugin-yml',
  'eslint',
  'globals',
  'jiti',
  'jsonc-eslint-parser',
  'typescript-eslint',
  'yaml-eslint-parser',
]

/**
 * Dependencies to add if the project uses [Jest](https://jestjs.io).
 */
export const JEST_DEPENDENCIES: string[] = ['eslint-plugin-jest']

/**
 * Dependencies to add if the project uses [Vitest](https://vitest.dev).
 */
export const VITEST_DEPENDENCIES: string[] = ['@vitest/eslint-plugin']

export function addEslintDependencies(tree: Tree, options: EslintDependencyOptions) {
  const { root, unitTestRunner } = options
  const deps = new Set(ESLINT_DEPENDENCIES)

  // Check jest first, since vitest may be implied by presence of 'vite.config.m?ts'
  if (unitTestRunner === 'jest' || detectConfig(tree, 'jest', root)) {
    for (const d of JEST_DEPENDENCIES) {
      deps.add(d)
    }
  } else if (unitTestRunner === 'vitest' || detectConfig(tree, 'vitest', root)) {
    for (const d of VITEST_DEPENDENCIES) {
      deps.add(d)
    }
  }

  addDependenciesToProject(tree, [], [...deps], joinPathFragments(root, 'package.json'))
}

export interface EslintDependencyOptions extends ProjectConfiguration {
  unitTestRunner?: 'jest' | 'vitest'
}
