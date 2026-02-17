import tseslintPlugin from 'typescript-eslint'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const tseslint = [
  tseslintPlugin.configs['recommended'],

  {
    files: getFilePatterns(FilePatterns.source),
    name: namer('ts-eslint'),
    rules: {
      /** I do what I want ¯\\\_(ツ)\_/¯ */
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  {
    files: getFilePatterns(FilePatterns.test),
    name: namer('disable no-non-null in tests'),
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
] satisfies InfiniteConfigArray

export default tseslint
