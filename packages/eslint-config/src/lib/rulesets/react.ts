import type { Rules } from './rules.js'

export const reactRules = {
  '@eslint-react/jsx-shorthand-boolean': 'warn',
  '@eslint-react/jsx-shorthand-fragment': 'warn',
  '@eslint-react/naming-convention/component-name': 'warn',
  '@eslint-react/naming-convention/context-name': 'warn',
  '@eslint-react/no-duplicate-key': 'error',
  '@eslint-react/no-missing-component-display-name': 'warn',
  '@eslint-react/no-missing-context-display-name': 'warn',
  '@eslint-react/prefer-read-only-props': 'error',
} satisfies Rules
