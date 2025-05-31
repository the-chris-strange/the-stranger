import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

export default [
  {
    files: getFilePatterns(FilePatterns.source),
    rules: {
      // I do what I want ¯\_(ツ)_/¯
      '@typescript-eslint/no-explicit-any': 'off',
      // unnecessary; ts language server covers this in vscode
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  {
    files: getFilePatterns(FilePatterns.test),
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
] satisfies FlatConfig.ConfigArray
