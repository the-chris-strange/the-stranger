import vitest from '@vitest/eslint-plugin'

import type { Linter } from 'eslint'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export default [
  vitest.configs['recommended'],

  {
    files: getFilePatterns(FilePatterns.test),
    name: namer('vitest'),
    rules: {
      'vitest/consistent-test-it': ['error', { fn: 'it' }],
      'vitest/prefer-hooks-in-order': 'warn',
      'vitest/valid-title': ['warn', { disallowedWords: ['should'] }],
    },
  },
] as Linter.Config[]
