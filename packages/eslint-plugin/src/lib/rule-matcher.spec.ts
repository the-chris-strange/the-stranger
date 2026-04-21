import { describe, expect, it } from 'vitest'

import { ruleMatcher } from './rule-matcher.js'

describe('ruleMatcher', () => {
  const testCases = ['things', '   ', '123', '@this/that-rule']

  it.each(testCases)('matches "%s" if given undefined', value => {
    const matcher = ruleMatcher()
    expect(matcher(value)).toBe(true)
  })

  it.each(testCases)('matches "%s" if given an empty array', value => {
    const matcher = ruleMatcher([])
    expect(matcher(value)).toBe(true)
  })

  it('matches plugin rules given a plugin name', () => {
    const ruleNames = [
      '@this/that-rule',
      'another-rule',
      '@that/this-rule',
      '@this/another-rule',
    ]
    const matcher = ruleMatcher(['this', '@that'])
    expect(ruleNames.map(e => matcher(e))).toStrictEqual([true, false, true, true])
  })
})
