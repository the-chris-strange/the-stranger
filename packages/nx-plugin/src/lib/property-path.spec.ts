import { describe, expect, it } from 'vitest'

import { propertyPath, setPropertyPath, splitPropertyPath } from './property-path'

describe('propertyPath', () => {
  it('gets top-level properties', () => {
    const obj = { foo: 'bar' }
    const path = 'foo'
    expect(propertyPath(obj, path)).toBe('bar')
  })

  it('gets nested properties', () => {
    const obj = {
      this: {
        that: [{}, {}, { spam: { chives: {}, eggs: { bar: 2, foo: 42 } } }],
        those: [],
      },
    }
    const path = 'this.that[2].spam["eggs"].foo'
    expect(propertyPath(obj, path)).toBe(42)
  })
})

describe('splitPropertyPath', () => {
  it('works with a top-level path (i.e. a string)', () => {
    expect(splitPropertyPath('path')).toContain('path')
  })

  it('parses numeric segments', () => {
    expect([...splitPropertyPath('0.1.2.3')]).toStrictEqual([0, 1, 2, 3])
  })

  it('handles mixed strings and numbers', () => {
    expect([...splitPropertyPath('this.that[2].spam["eggs"].foo')]).toStrictEqual([
      'this',
      'that',
      2,
      'spam',
      'eggs',
      'foo',
    ])
  })

  it('handles single quoted segments', () => {
    expect([...splitPropertyPath("root['child'].leaf")]).toStrictEqual([
      'root',
      'child',
      'leaf',
    ])
  })
})

describe('setPropertyPath', () => {
  it('creates nested objects via dot path', () => {
    const obj: Record<string, unknown> = {}
    setPropertyPath(obj, 'foo.bar.baz', 7)

    expect(obj).toStrictEqual({ foo: { bar: { baz: 7 } } })
    expect(propertyPath(obj, 'foo.bar.baz')).toBe(7)
  })

  it('creates nested arrays via bracket path', () => {
    const obj: Record<string, unknown> = {}
    setPropertyPath(obj, 'items[1].name', 'thing')

    expect(obj).toMatchObject({ items: [undefined, { name: 'thing' }] })
    expect(propertyPath(obj, 'items[1].name')).toBe('thing')
  })

  it('sets values inside Maps', () => {
    const obj = new Map<string, any>()
    setPropertyPath(obj, 'level1[0]', 'ok')

    expect(obj.get('level1')).toEqual(['ok'])
    expect(propertyPath(obj, 'level1[0]')).toBe('ok')
  })
})
