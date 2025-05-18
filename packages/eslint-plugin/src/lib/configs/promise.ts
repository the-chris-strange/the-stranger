import promise from 'eslint-plugin-promise'

import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

/**
 * Default configuration for [eslint-plugin-promise](https://github.com/eslint-community/eslint-plugin-promise?tab=readme-ov-file#readme).
 */
export default [
  promise.configs['flat/recommended'],

  {
    files: getFilePatterns(FilePatterns.source),
    rules: {
      'promise/no-multiple-resolved': 'warn',
      'promise/prefer-await-to-callbacks': 'warn',
      'promise/prefer-await-to-then': 'warn',
      'promise/spec-only': 'error',
    },
  },
] satisfies FlatConfig.ConfigArray
