import tseslint from 'typescript-eslint'

import jsdoc from './lib/configs/jsdoc'
import n from './lib/configs/n'
import nx from './lib/configs/nx'
import perfectionist from './lib/configs/perfectionist'
import promise from './lib/configs/promise'
import toml from './lib/configs/toml'
import ts from './lib/configs/typescript-eslint'
import unicorn from './lib/configs/unicorn'
import vitest from './lib/configs/vitest'
import yml from './lib/configs/yml'
import { meta } from './lib/meta'

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
)

const recommended = tseslint.config(base, vitest)

export const configs = {
  base,
  jsdoc,
  nx,
  perfectionist,
  promise,
  recommended,
  testFiles,
  toml,
  ts,
  unicorn,
  vitest,
  yml,
}

export default { configs, meta }
