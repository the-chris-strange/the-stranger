import unicorn from 'eslint-plugin-unicorn'
import { defineConfig } from 'eslint/config'

import { namer } from '../namer.js'
import { FilePatterns, getFilePatterns } from '../patterns.js'

export default defineConfig(
  unicorn.configs['recommended'],

  {
    files: ['**/*'],
    name: namer('unicorn/allow abbreviations'),
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  {
    files: [getFilePatterns(FilePatterns.source)],
    name: namer('unicorn/base'),
    rules: {
      'unicorn/custom-error-definition': 'warn',
      'unicorn/import-style': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-reverse': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-keyword-prefix': 'error',
      'unicorn/no-useless-undefined': ['error', { checkArrowFunctionBody: false }],
      'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
      'unicorn/prefer-import-meta-properties': 'warn',
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/prefer-node-protocol': 'off',
    },
  },

  {
    files: getFilePatterns(FilePatterns.cjs),
    name: namer("unicorn/CJS files don't have to be modules"),
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },

  {
    files: getFilePatterns(FilePatterns.react),
    name: namer('unicorn/allow pascal case for react files'),
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
    name: namer('unicorn/test files'),
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
)
