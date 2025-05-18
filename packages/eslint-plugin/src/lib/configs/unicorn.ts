import unicorn from 'eslint-plugin-unicorn'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

/**
 * Default configuration for [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn#readme).
 */
export default [
  unicorn.configs['recommended'],

  {
    files: [getFilePatterns(FilePatterns.source)],
    rules: {
      'unicorn/import-style': ['warn', { styles: { path: { named: true } } }],
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/prefer-number-properties': 'off',
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
