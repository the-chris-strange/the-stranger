import type { Rules } from './rules.js'

/**
 * Rules common to both `eslint-plugin-jest` and `@vitest/eslint-plugin`.
 */
export const commonTestRules = {
  'consistent-test-it': ['error', { fn: 'it' }] as const,
  'expect-expect': 'error',
  'no-commented-out-tests': 'off',
  'no-conditional-in-test': 'warn',
  'no-duplicate-hooks': 'warn',
  'no-focused-tests': 'warn',
  'no-test-prefixes': 'error',
  'no-test-return-statement': 'error',
  'no-unneeded-async-expect-function': 'error',
  'prefer-comparison-matcher': 'error',
  'prefer-each': 'error',
  'prefer-equality-matcher': 'error',
  'prefer-expect-resolves': 'error',
  'prefer-hooks-in-order': 'error',
  'prefer-hooks-on-top': 'error',
  'prefer-mock-promise-shorthand': 'error',
  'prefer-mock-return-shorthand': 'error',
  'prefer-spy-on': 'error',
  'prefer-strict-equal': 'error',
  'prefer-to-be': 'error',
  'prefer-to-contain': 'error',
  'prefer-to-have-length': 'error',
} satisfies Rules

export function createCommonTestRules(pluginName: 'jest' | 'vitest'): Rules {
  // the name of the container of test utility functions
  const utilityName = pluginName === 'vitest' ? 'vi' : pluginName

  const rules: Rules = {
    [`${pluginName}/prefer-${utilityName}-mocked`]: 'error',
    [`${pluginName}/prefer-importing-${pluginName}-globals`]: 'error',
  }

  return Object.entries(commonTestRules).reduce<Rules>((acc, [ruleName, value]) => {
    acc[`${pluginName}/${ruleName}`] = value
    return acc
  }, rules)
}

export const jestTestFileRules = {
  'jest/no-confusing-set-timeout': 'error',
  'jest/no-export': 'off',

  ...createCommonTestRules('jest'),
} satisfies Rules

export const vitestTestFileRules = {
  'vitest/consistent-vitest-vi': ['error', { fn: 'vi' }],
  'vitest/hoisted-apis-on-top': 'error',
  'vitest/no-conditional-tests': 'error',
  'vitest/prefer-expect-type-of': 'error',
  'vitest/prefer-import-in-mock': 'error',
  'vitest/prefer-to-be': 'error',
  'vitest/prefer-to-contain': 'error',
  'vitest/prefer-to-have-length': 'error',

  ...createCommonTestRules('vitest'),
} satisfies Rules
