import type { Rules } from './rules.js'

export const promiseRules = {
  'promise/no-multiple-resolved': 'warn',
  'promise/prefer-await-to-callbacks': 'warn',
  'promise/prefer-await-to-then': 'warn',
  'promise/spec-only': 'error',
} satisfies Rules
