import { describe, expect, it } from 'vitest'

import { toArray } from './type-utils'

describe('toArray', () => {
  it.each([null, undefined])('returns an empty array given "%s"', value => {
    expect(toArray(value)).toStrictEqual([])
  })

  it('returns an empty array given no input', () => {
    expect(toArray()).toStrictEqual([])
  })

  it('filters out null values', () => {
    expect(toArray(['foo', 'bar', null, null, 'spam'])).not.toContain(null)
  })

  /* eslint-disable unicorn/new-for-builtins */
  it.each([
    ['strings', ['foo', 'bar']],
    ['numbers', [0, 1, Number(2), 3.456, 7_890_123_456_789]],
    ['booleans', [true, false]],
    ['bigints', [BigInt(1), BigInt(2)]],
    ['objects', [{}, {}]],
    ['symbols', [Symbol.for('spam'), Symbol.for('eggs')]],
    ['boxed strings', [new String('foo')]],
    ['boxed numbers', [new Number(1)]],
    ['boxed booleans', [new Boolean(true)]],
  ])('works with %s', (_, value) => {
    expect(toArray(value as any)).toStrictEqual(value)
  })
  /* eslint-enable unicorn/new-for-builtins */
})
