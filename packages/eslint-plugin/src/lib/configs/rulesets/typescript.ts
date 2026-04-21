import type { Rules } from './rules.js'

export const typescriptRules = {
  '@typescript-eslint/consistent-type-imports': [
    'warn',
    { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
  ],
  '@typescript-eslint/no-empty-object-type': 'error',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-optional-chain': 'error',
} satisfies Rules
