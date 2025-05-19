import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { FilePatterns, getFilePatterns } from '../patterns'

/**
 * Default configuration for [typescript-eslint](https://typescript-eslint.io/).
 */
export default [
  {
    files: getFilePatterns(FilePatterns.source),
    rules: {
      // I'll declare whatever I want ¯\_(ツ)_/¯
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
