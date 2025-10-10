import { defineConfig } from 'eslint/config'

import jsdoc from './jsdoc.js'
import n from './n.js'
import perfectionist from './perfectionist.js'
import promise from './promise.js'
import regexp from './regexp.js'
import ts from './typescript-eslint.js'
import unicorn from './unicorn.js'
import yml from './yml.js'

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
)

const recommendedConfigs = [jsdoc, n, perfectionist, promise, regexp, ts, unicorn, yml]

const recommended = defineConfig(base, recommendedConfigs)

const configs = {
  base,
  recommended,
}

export { configs }
