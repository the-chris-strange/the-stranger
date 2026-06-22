import type { Rules } from './rules.js'

/**
 * Rules that are extensions of core ESLint rules, and thus require the core rule to be turned off.
 */
const typescriptExtendedRules = {
  '@typescript-eslint/no-unused-private-class-members': 'error',
  '@typescript-eslint/no-useless-constructor': 'error',
  'no-unused-private-class-members': 'off',
  'no-useless-constructor': 'off',
} satisfies Rules

export const typescriptRules = {
  ...typescriptExtendedRules,

  '@typescript-eslint/consistent-generic-constructors': 'error',
  // '@typescript-eslint/consistent-type-definitions': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
  ],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-member-accessibility': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  // '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-dynamic-delete': 'error',
  '@typescript-eslint/no-empty-object-type': 'error',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/parameter-properties': 'off',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/unified-signatures': 'warn',
} satisfies Rules

export const typescriptTestFileRules = {
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
} satisfies Rules
