import type { Rules } from './rules.js'

export const unicornRules = {
  'unicorn/custom-error-definition': 'warn',
  'unicorn/import-style': 'off',
  'unicorn/no-array-reverse': 'off',
  'unicorn/no-array-sort': 'off',
  /** Same as {@link https://typescript-eslint.io/rules/prefer-for-of} */
  'unicorn/no-for-loop': 'off',
  'unicorn/no-process-exit': 'off',
  /** Same as {@link https://typescript-eslint.io/rules/no-extraneous-class} */
  'unicorn/no-static-only-class': 'off',
  /** Same as {@link https://typescript-eslint.io/rules/await-thenable} */
  'unicorn/no-unnecessary-await': 'off',
  'unicorn/numeric-separators-style': ['warn', { number: { minimumDigits: 12 } }],
  /** Same as {@link https://typescript-eslint.io/rules/prefer-find} */
  'unicorn/prefer-array-find': 'off',
  'unicorn/prefer-math-trunc': 'off',
  /** Same as {@link https://typescript-eslint.io/rules/prefer-regexp-exec} */
  'unicorn/prefer-regexp-test': 'off',
} satisfies Rules

export const unicornTestFileRules = {
  'unicorn/no-nested-ternary': 'off',
  'unicorn/no-null': 'off',
  'unicorn/no-useless-undefined': [
    'error',
    { checkArguments: false, checkArrowFunctionBody: false },
  ],
} satisfies Rules
