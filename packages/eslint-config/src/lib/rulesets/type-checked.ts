import type { Rules } from './rules.js'

const typeCheckedExtendedRules = {
  // '@typescript-eslint/dot-notation': 'error',
  '@typescript-eslint/require-await': 'error',
  // 'dot-notation': 'off',
  'require-await': 'off',
} satisfies Rules

export const typeCheckedRules = {
  ...typeCheckedExtendedRules,

  '@typescript-eslint/no-deprecated': 'warn',
  '@typescript-eslint/no-mixed-enums': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-template-expression': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'warn',
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-unnecessary-type-conversion': 'error',
  // if this rule becomes too noisy, remove it
  // '@typescript-eslint/no-unnecessary-type-parameters': 'warn',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-useless-default-assignment': 'warn',
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/prefer-find': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
  '@typescript-eslint/prefer-regexp-exec': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/related-getter-setter-pairs': 'error',
  '@typescript-eslint/return-await': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
} satisfies Rules

export const typeCheckedTestFileRules = {
  // '@typescript-eslint/dot-notation': [
  //   'error',
  //   { allowPrivateClassPropertyAccess: true, allowProtectedClassPropertyAccess: true },
  // ],
} satisfies Rules
