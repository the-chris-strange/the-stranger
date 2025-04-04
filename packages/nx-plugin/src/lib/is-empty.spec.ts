import { describe, expect, it } from 'vitest'

import { isEmpty } from './is-empty'

describe('isEmpty', () => {
  it('detects an empty string', () => {
    expect(isEmpty('')).toBe(true)
  })

  it('detects an array with no members', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('detects an array containing only empty members', () => {
    // eslint-disable-next-line unicorn/no-null
    expect(isEmpty([null, undefined, [], [null, [undefined]], ''])).toBe(true)
  })

  it('detects an object with no keys', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('detects an object with only empty values', () => {
    expect(isEmpty({ bar: [], baz: {}, spam: '' })).toBe(true)
  })

  it.each([
    ['array', [[[]]]],
    ['object', { key: { key: {} } }],
  ])('returns false given an %s deeper than maxDepth', (_, value) => {
    expect(isEmpty(value, 1)).toBe(false)
  })

  it('searches deeply nested arrays', () => {
    const depth = 200
    let deepValue: any = []
    for (let i = depth; i > 0; i--) {
      deepValue = [deepValue]
    }
    expect(isEmpty(deepValue, depth)).toBe(true)
  })

  it('searches deeply nested objects', () => {
    const depth = 200
    let deepValue: any = {}
    for (let i = depth; i > 0; i--) {
      deepValue = { key: deepValue }
    }
    expect(isEmpty(deepValue, depth)).toBe(true)
  })

  it('throws if maxDepth > 200', () => {
    expect(() => {
      isEmpty({}, 201)
    }).toThrow()
  })
})
