import type { Rules } from './rules.js'

export const playwrightRules = {
  'playwright/prefer-strict-equal': 'error',
  'playwright/prefer-to-be': 'error',
  'playwright/prefer-to-contain': 'error',
  'playwright/require-hook': 'error',
} satisfies Rules
