/* eslint-disable perfectionist/sort-objects -- Fixtures intentionally contain unsorted document keys. */
import { describe, expect, it } from 'vitest'

import { makeStringComparator, makeValueComparator } from './compare.js'

describe('public comparators', () => {
  it('compares strings using direction, natural order and case sensitivity', () => {
    const compare = makeStringComparator({
      caseSensitive: false,
      natural: true,
      direction: 'desc',
    })
    expect(compare('item10', 'item2')).toBeLessThan(0)
    expect(compare('A', 'a')).toBe(0)
    expect(compare('same', 'same')).toBe(0)
  })

  it('compares values by type and numeric value', () => {
    const compare = makeValueComparator({
      caseSensitive: true,
      natural: false,
      direction: 'asc',
    })
    expect(compare(null, undefined)).toBeLessThan(0)
    expect(compare(false, true)).toBeLessThan(0)
    expect(compare(2, 10)).toBeLessThan(0)
    expect(compare(10, '1')).toBeLessThan(0)
    expect(compare('a', [])).toBeLessThan(0)
    expect(compare([], {})).toBeLessThan(0)
    expect(compare(2, 2)).toBe(0)
  })
})
