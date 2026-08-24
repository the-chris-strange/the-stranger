import { describe, expect, it } from 'vitest'

import { getProperty } from './get-property'
import { parsePath } from './parse-path'

describe('getProperty', () => {
  it('gets top-level and nested properties', () => {
    const object = {
      this: {
        that: [{}, {}, { spam: { eggs: { value: 42 } } }],
      },
    }

    expect(getProperty(object, 'this.that[2].spam["eggs"].value')).toBe(42)
  })

  it('accepts parsed and iterable paths', () => {
    const object = { items: [{ name: 'first' }, { name: 'last' }] }

    expect(getProperty(object, parsePath('$.items[-1].name'))).toBe('last')
    expect(getProperty(object, ['items', 0, 'name'])).toBe('first')
  })

  it('decodes escaped quoted properties', () => {
    const object = { 'with.dot': { 'line\nbreak': 42 } }

    expect(getProperty(object, String.raw`$["with.dot"]["line\nbreak"]`)).toBe(42)
  })

  it('gets values from maps', () => {
    const object = new Map<PropertyKey, unknown>([
      ['level1', new Map<PropertyKey, unknown>([[1, 'value']])],
    ])

    expect(getProperty(object, ['level1', 1])).toBe('value')
  })

  it('supports symbols in iterable paths', () => {
    const key = Symbol('key')
    const object = { [key]: { value: 42 } }

    expect(getProperty(object, [key, 'value'])).toBe(42)
  })

  it('returns the root value for an empty path', () => {
    const object = { value: 42 }

    expect(getProperty(object, '')).toBe(object)
    expect(getProperty(object, '$')).toBe(object)
    expect(getProperty(object, [])).toBe(object)
  })

  it('returns undefined when a path cannot be reached', () => {
    const object = { missing: null, values: ['first'] }

    expect(getProperty(object, 'missing.value')).toBeUndefined()
    expect(getProperty(object, 'values[2]')).toBeUndefined()
    expect(getProperty(object, ['values', 0.5])).toBeUndefined()
  })

  it('rejects malformed string paths', () => {
    expect(() => getProperty({}, 'root..leaf')).toThrow(
      'Expected a property after the dot',
    )
  })
})
