import jestPlugin from 'eslint-plugin-jest'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const jest = [
  {
    extends: [jestPlugin.configs['flat/recommended'], jestPlugin.configs['flat/style']],
    files: getFilePatterns(FilePatterns.test),
    name: namer('jest'),
    rules: {
      'jest/consistent-test-it': ['error', { fn: 'it' }],
      'jest/no-confusing-set-timeout': 'error',
      'jest/prefer-each': 'warn',
      'jest/prefer-equality-matcher': 'error',
      'jest/prefer-expect-resolves': 'warn',
      'jest/prefer-hooks-in-order': 'error',
      'jest/prefer-hooks-on-top': 'warn',
      'jest/prefer-importing-jest-globals': 'error',
      'jest/prefer-jest-mocked': 'warn',
      'jest/prefer-lowercase-title': 'warn',
      'jest/prefer-mock-promise-shorthand': 'warn',
      'jest/prefer-spy-on': 'warn',
      'jest/prefer-strict-equal': 'warn',
      'jest/valid-title': ['warn', { disallowedWords: ['should'] }],
    },
  },
] satisfies InfiniteConfigArray

export default jest
