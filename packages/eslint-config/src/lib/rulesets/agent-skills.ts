import type { Rules } from './rules.js'

export const agentSkillsRules = {
  'n/hashbang': 'off',
  'n/no-process-exit': 'off',

  'unicorn/prefer-number-coercion': 'off',
  'unicorn/prefer-unicode-code-point-escapes': 'off',
} satisfies Rules
