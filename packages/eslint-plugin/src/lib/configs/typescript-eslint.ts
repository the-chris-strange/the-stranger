import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'

import { SOURCE_FILES, TEST_FILES } from '../files'

/**
 * Default configuration for [typescript-eslint](https://typescript-eslint.io/).
 */
export default [
  {
    files: SOURCE_FILES,
    rules: {
      // I'll declare whatever I want ¯\_(ツ)_/¯
      '@typescript-eslint/no-explicit-any': 'off',
      // unnecessary; ts language server covers this in vscode
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  {
    files: TEST_FILES,
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
] satisfies FlatConfig.ConfigArray
