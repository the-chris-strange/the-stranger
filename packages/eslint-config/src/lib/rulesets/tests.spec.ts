import { describe, expect, it } from 'vitest'

import { commonTestRules, createCommonTestRules } from './tests.js'

describe('common test rule creator', () => {
  it.each(Object.entries(commonTestRules))('includes %s', (key, value) => {
    expect(createCommonTestRules('vitest')).toHaveProperty(`vitest/${key}`, value)
    expect(createCommonTestRules('jest')).toHaveProperty(`jest/${key}`, value)
  })

  it.each(['vitest', 'jest'] as const)(
    'sets the correct module in the prefer-importing-{n}-globals rule',
    key => {
      expect(createCommonTestRules(key)).toHaveProperty(
        `${key}/prefer-importing-${key}-globals`,
        'error',
      )
    },
  )

  it('sets the correct name for the prefer-{n}-mocked rules', () => {
    expect(createCommonTestRules('jest')).toHaveProperty(
      'jest/prefer-jest-mocked',
      'error',
    )
    expect(createCommonTestRules('vitest')).toHaveProperty(
      'vitest/prefer-vi-mocked',
      'error',
    )
  })
})
