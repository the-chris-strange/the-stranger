import { describe, expect, it } from 'vitest'

import { makeStringComparator, makeValueComparator } from './compare.js'

describe('public comparators', () => {
  it.each([
    ['lexical', ['a', 'Z', '_', 'A'], ['A', 'Z', '_', 'a']],
    ['locale', ['Z', 'a'], ['a', 'Z']],
    ['locale', ['item2', 'item10'], ['item10', 'item2']],
    ['natural', ['item10', 'item2'], ['item2', 'item10']],
  ] as const)('selects %s comparison', (sortType, input, expected) => {
    const compare = makeStringComparator({
      caseSensitive: true,
      direction: 'asc',
      sortType,
    })
    expect([...input].sort(compare)).toStrictEqual([...expected])
  })

  it('applies case sensitivity and direction to lexical sorting', () => {
    const compare = makeStringComparator({
      caseSensitive: false,
      direction: 'desc',
      sortType: 'lexical',
    })
    expect(['B', 'b', 'a'].sort(compare)).toStrictEqual(['B', 'b', 'a'])
    expect(compare('A', 'a')).toBe(0)
  })

  it('rejects unsupported sort types from untyped callers', () => {
    expect(() =>
      makeStringComparator({
        caseSensitive: true,
        direction: 'asc',
        sortType: 'unsupported' as never,
      }),
    ).toThrow(/sort type/i)
  })

  it('compares strings using direction, natural order and case sensitivity', () => {
    const compare = makeStringComparator({
      caseSensitive: false,
      sortType: 'natural',
      direction: 'desc',
    })
    expect(compare('item10', 'item2')).toBeLessThan(0)
    expect(compare('A', 'a')).toBe(0)
    expect(compare('same', 'same')).toBe(0)
  })

  it('compares values by type and numeric value', () => {
    const compare = makeValueComparator({
      caseSensitive: true,
      sortType: 'locale',
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
