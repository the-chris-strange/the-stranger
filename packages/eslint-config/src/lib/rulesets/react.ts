import type { Rules } from './rules.js'

export const reactRules = {
  '@eslint-react/naming-convention-context-name': 'warn',
  '@eslint-react/no-duplicate-key': 'error',
  '@eslint-react/no-missing-component-display-name': 'warn',
  '@eslint-react/no-missing-context-display-name': 'warn',
} satisfies Rules
