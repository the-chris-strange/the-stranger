import type { Rules } from './rules.js'

export const unicornRules = {
  'unicorn/custom-error-definition': 'warn',
  'unicorn/import-style': 'off',
  'unicorn/no-array-reverse': 'off',
  'unicorn/no-array-sort': 'off',
  'unicorn/no-process-exit': 'off',
  'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
  'unicorn/prefer-math-trunc': 'off',
} satisfies Rules
