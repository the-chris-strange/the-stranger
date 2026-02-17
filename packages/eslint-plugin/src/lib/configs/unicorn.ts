import unicornPlugin from 'eslint-plugin-unicorn'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const sourceFiles = [
  {
    extends: [unicornPlugin.configs['recommended']],
    files: getFilePatterns(FilePatterns.source),
    name: namer('unicorn/source-files'),
    rules: {
      'unicorn/catch-error-name': 'off',
      'unicorn/consistent-assert': 'off',
      'unicorn/custom-error-definition': 'warn',
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-empty-file': 'off',
      // covered by n/no-process-exit
      'unicorn/no-process-exit': 'off',
      'unicorn/no-useless-undefined': ['error', { checkArrowFunctionBody: false }],
      'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
      'unicorn/prefer-import-meta-properties': 'warn',
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/prefer-module': 'off',
      // covered by n/prefer-node-protocol
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },
] satisfies InfiniteConfigArray

export const testFiles = [
  {
    files: getFilePatterns(FilePatterns.test),
    name: namer('unicorn/test-files'),
    rules: {
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-nested-ternary': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': [
        'error',
        { checkArguments: false, checkArrowFunctionBody: false },
      ],
    },
  },
] satisfies InfiniteConfigArray

export const unicorn = [...sourceFiles, ...testFiles] satisfies InfiniteConfigArray

export default unicorn
