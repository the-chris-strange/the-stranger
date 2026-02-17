import vitestPlugin from '@vitest/eslint-plugin'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const vitest = [
  {
    extends: [vitestPlugin.configs['recommended']],
    files: getFilePatterns(FilePatterns.test),
    name: namer('vitest'),
    rules: {
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
    },
  },
] satisfies InfiniteConfigArray

export default vitest
