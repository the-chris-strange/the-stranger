import tseslintPlugin from 'typescript-eslint'

import type { Config } from 'eslint/config'

import type { InfiniteConfigArray } from '../extend-config.js'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export const languageOptions = {
  parser: tseslintPlugin.parser,
  parserOptions: {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
  },
} satisfies Config['languageOptions']

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

export const typeChecked = [
  {
    extends: [tseslint, tseslintPlugin.configs['recommendedTypeCheckedOnly']],
    files: getFilePatterns(FilePatterns.ts),
    languageOptions,
  },
] satisfies InfiniteConfigArray

export const typeCheckedStrict = [
  {
    extends: [tseslint, tseslintPlugin.configs['strictTypeCheckedOnly']],
    files: getFilePatterns(FilePatterns.ts),
    languageOptions,
  },
]

export default tseslint
