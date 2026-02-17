import nPlugin from 'eslint-plugin-n'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const n = [
  {
    extends: [nPlugin.configs['flat/recommended']],
    files: getFilePatterns(FilePatterns.source),
    name: namer('n(ode)'),
    rules: {
      'n/exports-style': ['error', 'module.exports'],
      'n/prefer-global/buffer': ['error', 'always'],
      'n/prefer-global/console': ['error', 'always'],
      'n/prefer-global/process': ['error', 'always'],
      'n/prefer-global/text-decoder': ['error', 'never'],
      'n/prefer-global/text-encoder': ['error', 'never'],
      'n/prefer-global/url': ['error', 'never'],
      'n/prefer-global/url-search-params': ['error', 'never'],
      'n/prefer-node-protocol': 'error',
    },
  },
] satisfies InfiniteConfigArray

export default n
