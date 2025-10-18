import { describe, expect, it, vi } from 'vitest'

import { isEmpty } from './is-empty'

describe('isEmpty', () => {
  it.each(
    [0, false, true, Symbol.for('tests'), () => 'things', BigInt(0)].map(e => [
      e,
      typeof e,
    ]),
  )('recognizes %s (type %s) as non-empty', (_, value) => {
    expect(isEmpty(value)).toBe(false)
  })

  it.each([null, undefined, ''])('recognizes "%s" as an empty value', value => {
    expect(isEmpty(value)).toBe(true)
  })

  it.each([
    ['an object with only empty values', { bar: [], baz: {}, spam: '' }],
    ['an object with no keys', {}],
    [
      'an array containing only empty members',
      [null, undefined, [], [null, [undefined]], ''],
    ],
    ['an array with no members', []],
  ])('recognizes %s as an empty value', (_, value) => {
    expect(isEmpty(value)).toBe(true)
  })

  it.each([
    ['array', [[[]]]],
    ['object', { key: { key: {} } }],
  ])('returns false given an %s deeper than maxDepth', (_, value) => {
    expect(isEmpty(value, 1)).toBe(false)
  })

  it('returns true given a deeply nested, empty array', () => {
    const depth = 200
    let deepValue: any = []
    for (let i = depth; i > 0; i--) {
      deepValue = [deepValue]
    }
    expect(isEmpty(deepValue, depth + 1)).toBe(true)
  })

  it('returns false given a deeply nested, non-empty array', () => {
    const depth = 200
    let deepValue: any = 'things'
    for (let i = depth; i > 0; i--) {
      deepValue = [deepValue]
    }
    expect(isEmpty(deepValue, depth + 1)).toBe(false)
  })

  it('returns true given a deeply nested, empty object', () => {
    const depth = 200
    let deepValue: any = {}
    for (let i = depth; i > 0; i--) {
      deepValue = { key: deepValue }
    }
    expect(isEmpty(deepValue, depth + 1)).toBe(true)
  })

  it('returns false given a deeply nested, non-empty object', () => {
    const depth = 200
    let deepValue: any = 'things'
    for (let i = depth; i > 0; i--) {
      deepValue = { key: deepValue }
    }
    expect(isEmpty(deepValue, depth + 1)).toBe(false)
  })

  it('returns true given an empty serialized JSON object', () => {
    const obj = { that: {}, this: [] }
    expect(isEmpty(JSON.stringify(obj))).toBe(true)
  })

  it('attempts to parse non-empty strings as JSON', () => {
    const obj = { that: {}, this: [] }
    const objString = JSON.stringify(obj)
    const spy = vi.spyOn(JSON, 'parse')
    expect(isEmpty(objString)).toBe(true)
    expect(spy).toHaveBeenCalledExactlyOnceWith(objString)
  })

  it('returns false given a non-empty, JSON-serialized object', () => {
    const obj = { that: {}, this: 'things' }
    expect(isEmpty(JSON.stringify(obj))).toBe(false)
  })

  it('returns false given a non-empty, non-JSON string', () => {
    const value = 'things'
    expect(isEmpty(value)).toBe(false)
  })
})
