import n from 'eslint-plugin-n'

import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'

export default defineConfig({
  name: namer('n(ode)'),
  plugins: { n },
  files: getFilePatterns(FilePatterns.source),
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
