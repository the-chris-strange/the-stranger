import { describe, expect, it } from 'vitest'

import { getProperty } from './get-property'
import { parsePath } from './parse-path'
import { setProperty } from './set-property'

describe('setProperty', () => {
  it('creates nested objects', () => {
    const object: Record<string, unknown> = {}

    expect(setProperty(object, 'foo.bar.baz', 7)).toBe(object)
    expect(object).toStrictEqual({ foo: { bar: { baz: 7 } } })
  })

  it('creates nested arrays for numeric segments', () => {
    const object: Record<string, unknown> = {}

    setProperty(object, 'items[1].name', 'thing')

    expect(object).toMatchObject({ items: [undefined, { name: 'thing' }] })
    expect(getProperty(object, 'items[1].name')).toBe('thing')
  })

  it('sets values inside maps', () => {
    const object = new Map<PropertyKey, unknown>()

    setProperty(object, 'level1[0]', 'ok')

    expect(object.get('level1')).toStrictEqual(['ok'])
  })

  it('accepts parsed paths and negative array indexes', () => {
    const object = { items: [{ name: 'first' }, { name: 'last' }] }

    setProperty(object, parsePath('$.items[-1].name'), 'updated')

    expect(object.items[1]?.name).toBe('updated')
  })

  it('supports symbols in iterable paths', () => {
    const key = Symbol('key')
    const object: Record<PropertyKey, unknown> = {}

    setProperty(object, [key, 'value'], 42)

    expect(object[key]).toStrictEqual({ value: 42 })
  })

  it('leaves the root object unchanged for an empty path', () => {
    const object = { value: 42 }

    expect(setProperty(object, '$', 'ignored')).toBe(object)
    expect(object).toStrictEqual({ value: 42 })
  })

  it('does not traverse inherited object properties', () => {
    const inherited = { branch: { inherited: true } }
    const object = Object.create(inherited) as Record<string, unknown>

    setProperty(object, 'branch.value', 42)

    expect(inherited).toStrictEqual({ branch: { inherited: true } })
    expect(object['branch']).toStrictEqual({ value: 42 })
  })

  it.each(['__proto__', 'constructor', 'prototype'])(
    'rejects the prototype-related segment %s',
    segment => {
      const object = {}

      expect(() => setProperty(object, [segment, 'polluted'], true)).toThrow(
        `Cannot set the forbidden property path segment "${segment}"`,
      )
      expect(Reflect.get(Object.prototype, 'polluted')).toBeUndefined()
    },
  )

  it('rejects invalid array indexes', () => {
    expect(() => setProperty([], [0.5], 'value')).toThrow(
      'Array index 0.5 must be an integer',
    )
    expect(() => setProperty([], [-1], 'value')).toThrow(
      'Array index -1 is out of bounds',
    )
  })

  it('rejects traversal through non-object values', () => {
    expect(() => setProperty({ branch: 1 }, 'branch.value', 42)).toThrow(
      'Cannot traverse a non-object value while setting a path',
    )
  })
})
