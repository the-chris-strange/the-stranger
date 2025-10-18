import n from 'eslint-plugin-n'
import { defineConfig } from 'eslint/config'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export default defineConfig({
  files: getFilePatterns(FilePatterns.source),
  name: namer('n(ode)'),
  plugins: { n },
  rules: {
    'n/exports-style': ['error', 'module.exports'],
    'n/hashbang': 'error',
    'n/no-deprecated-api': 'error',
    'n/no-process-exit': 'error',
    'n/prefer-global/buffer': ['error', 'always'],
    'n/prefer-global/console': ['error', 'always'],
    'n/prefer-global/process': ['error', 'always'],
    'n/prefer-global/text-decoder': ['error', 'never'],
    'n/prefer-global/text-encoder': ['error', 'never'],
    'n/prefer-global/url': ['error', 'never'],
    'n/prefer-global/url-search-params': ['error', 'never'],
    'n/prefer-node-protocol': 'error',
  },
})
