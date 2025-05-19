import tseslint from 'typescript-eslint'

import cypress from './lib/configs/cypress'
import jsdoc from './lib/configs/jsdoc'
import n from './lib/configs/n'
import nx from './lib/configs/nx'
import perfectionist from './lib/configs/perfectionist'
import promise from './lib/configs/promise'
import re from './lib/configs/regexp'
import toml from './lib/configs/toml'
import ts from './lib/configs/typescript-eslint'
import unicorn from './lib/configs/unicorn'
import vitest from './lib/configs/vitest'
import yml from './lib/configs/yml'
import { meta } from './lib/meta'
import dependencyChecksConfig from './nx-dependency-checks'

const testFiles = tseslint.config(vitest) // todo: add jest config also

const base = tseslint.config(
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

  nx,
  perfectionist,
  unicorn,
  ts,
  jsdoc,
  promise,
  n,
  re,
)

const recommended = tseslint.config(base, vitest)

export const configs = {
  base,
  cypress,
  jsdoc,
  nx,
  'nx/dependency-checks': dependencyChecksConfig,
  perfectionist,
  promise,
  recommended,
  'recommended/tests': testFiles,
  toml,
  ts,
  unicorn,
  vitest,
  yml,
}

export default { configs, meta }
