import type { Rules } from './rules.js'

export const baseRules = {
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-member-accessibility': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-deprecated': 'warn',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/parameter-properties': 'off',
  '@typescript-eslint/prefer-return-this-type': 'error',

  'jsdoc/require-jsdoc': 'off',
  'jsdoc/require-returns': ['warn', { checkGetters: false }],

  'n/exports-style': ['error', 'module.exports'],
  'n/hashbang': 'error',
  'n/no-deprecated-api': 'error',
  'n/no-process-exit': 'error',
  'n/prefer-global/buffer': ['error', 'always'],
  'n/prefer-global/console': ['error', 'always'],
  'n/prefer-global/process': ['error', 'always'],
  'n/prefer-global/text-decoder': ['error', 'never'],
  'n/prefer-global/text-encoder': ['error', 'never'],
  'n/prefer-global/url': ['error', 'never'],
  'n/prefer-global/url-search-params': ['error', 'never'],
  'n/prefer-node-protocol': 'error',

  'promise/no-multiple-resolved': 'warn',
  'promise/prefer-await-to-callbacks': 'warn',
  'promise/prefer-await-to-then': 'warn',
  'promise/spec-only': 'error',

  'unicorn/custom-error-definition': 'warn',
  'unicorn/import-style': 'off',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/no-array-reduce': 'off',
  'unicorn/no-array-reverse': 'off',
  'unicorn/no-array-sort': 'off',
  'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
  'unicorn/prefer-math-trunc': 'off',
  'unicorn/prevent-abbreviations': 'off',
} satisfies Rules
