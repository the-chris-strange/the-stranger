import n from 'eslint-plugin-n'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

export default [
  { plugins: { n } },

  {
    files: getFilePatterns(FilePatterns.source),
    rules: {
      'n/export-style': ['error', 'module.exports'],
      'n/hashbang': 'error',
      'n/no-deprecated-api': 'error',
      'n/no-process-exit': 'error',
      'n/prefer-global/buffer': ['error', 'never'],
      'n/prefer-global/console': ['error', 'never'],
      'n/prefer-global/process': ['error', 'never'],
      'n/prefer-global/text-decoder': ['error', 'never'],
      'n/prefer-global/text-encoder': ['error', 'never'],
      'n/prefer-global/url': ['error', 'never'],
      'n/prefer-global/url-search-params': ['error', 'never'],
      'n/prefer-node-protocol': 'error',
    },
  },
] satisfies FlatConfig.ConfigArray
