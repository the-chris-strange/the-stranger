import unicorn from 'eslint-plugin-unicorn'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

export default [
  unicorn.configs['recommended'],

  {
    files: [getFilePatterns(FilePatterns.source)],
    rules: {
      'unicorn/import-style': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-keyword-prefix': 'error',
      'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
      'unicorn/prefer-import-meta-properties': 'warn',
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/prefer-node-protocol': 'off',
    },
  },

  {
    files: ['**/*'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  {
    files: getFilePatterns(FilePatterns.cjs),
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },

  {
    files: getFilePatterns(FilePatterns.react),
    rules: {
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
    },
  },

  {
    files: getFilePatterns(FilePatterns.test),
    rules: { 'unicorn/consistent-function-scoping': 'off' },
  },
] satisfies FlatConfig.ConfigArray
