import { defineConfig } from 'eslint/config'
import { createRequire } from 'node:module'
import { requireModule } from '../require-utils'
import jsdoc from './jsdoc'
import n from './n'
import perfectionist from './perfectionist'
import promise from './promise'
import regexp from './regexp'
import ts from './typescript-eslint'
import unicorn from './unicorn'
import yml from './yml'

const require = createRequire(import.meta.filename)

const requireCypress = requireModule<typeof import('./cypress').default>(
  './cypress',
  'cypress',
  'eslint-plugin-cypress',
)

const requireJest = requireModule<typeof import('./jest').default>(
  './jest',
  'jest',
  'eslint-plugin-jest',
)

const requireToml = requireModule<typeof import('./toml').default>(
  './toml',
  'toml-eslint-parser',
  'eslint-plugin-toml',
)

const requireVitest = requireModule<typeof import('./vitest').default>(
  './vitest',
  'vitest',
  '@vitest/eslint-plugin',
)

const requireNx = requireModule<typeof import('./nx').default>(
  './nx',
  'nx',
  '@nx/eslint-plugin',
)

const base = defineConfig(
  {
    ignores: [
      '.cache',
      '.github',
      '.nx',
      '.pnp.*',
      '.yarn',
      'coverage',
      'dist',
      'node_modules',
      'tmp',
    ],
  },

  { linterOptions: { reportUnusedDisableDirectives: 'error' } },

  perfectionist,
  ts,
  yml,
)

const recommendedConfigs = [base, jsdoc, n, promise, regexp, unicorn]
const testFilesConfig = requireVitest(false) ?? requireJest(false)
if (testFilesConfig !== undefined) {
  recommendedConfigs.unshift(testFilesConfig)
}
const recommended = defineConfig(recommendedConfigs)

export const configs = {
  base,
  recommended,

  get ['nx']() {
    return requireNx(true)
  },

  get ['toml']() {
    return requireToml(true)
  },

  get ['cypress']() {
    return requireCypress(true)
  },

  get ['recommended/tests']() {
    if (testFilesConfig === undefined) {
      throw new Error(
        'No test-related plugins are installed; install one and try again',
      )
    }
    return testFilesConfig
  },

  get ['nx/dependency-checks'](): typeof import('./nx').dependencyChecks {
    return require('./nx').dependencyChecks
  },
}
