import unicorn from 'eslint-plugin-unicorn'
import { defineConfig } from 'eslint/config'
import { namer } from '../namer'
import { FilePatterns, getFilePatterns } from '../patterns'

export default defineConfig(
  unicorn.configs['recommended'],

  {
    name: namer('unicorn/allow abbreviations'),
    files: ['**/*'],
    rules: {
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  {
    name: namer('unicorn/base'),
    files: [getFilePatterns(FilePatterns.source)],
    rules: {
      'unicorn/import-style': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-keyword-prefix': 'error',
      'unicorn/no-useless-undefined': ['error', { checkArrowFunctionBody: false }],
      'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
      'unicorn/prefer-import-meta-properties': 'warn',
      'unicorn/prefer-math-trunc': 'off',
      'unicorn/prefer-node-protocol': 'off',
    },
  },

  {
    name: namer("unicorn/CJS files don't have to be modules"),
    files: getFilePatterns(FilePatterns.cjs),
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },

  {
    name: namer('unicorn/allow pascal case for react files'),
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
    name: namer('unicorn/test files'),
    files: getFilePatterns(FilePatterns.test),
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
