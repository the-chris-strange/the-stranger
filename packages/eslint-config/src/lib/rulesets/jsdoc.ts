import type { Rules } from './rules.js'

export const jsdocRules = {
  'jsdoc/require-jsdoc': 'off',
  'jsdoc/require-returns': ['warn', { checkGetters: false }],
} satisfies Rules
