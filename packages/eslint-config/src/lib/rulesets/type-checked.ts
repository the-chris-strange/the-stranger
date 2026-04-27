import type { Rules } from './rules.js'

export const typeCheckedRules = {
  '@typescript-eslint/no-deprecated': 'warn',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/prefer-return-this-type': 'error',
} satisfies Rules
