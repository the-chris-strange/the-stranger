import { describe, expect, it } from 'vitest'

import { buildNamedOrderRanks, resolveObjectKeyOptions, sortValue } from './core.js'

describe('document sorting', () => {
  it('lets later path overrides replace the selected comparison mode', () => {
    const output = sortValue(
      { lexical: ['a', 'Z'], locale: ['Z', 'a'], natural: ['item10', 'item2'] },
      {
        arrayValues: {
          sortType: 'lexical',
          overrides: [
            { pathPattern: 'locale', sortType: 'locale' },
            { pathPattern: 'natural', sortType: 'locale' },
            { pathPattern: 'natural', sortType: 'natural' },
          ],
        },
      },
    )
    expect(output.lexical).toStrictEqual(['Z', 'a'])
    expect(output.locale).toStrictEqual(['a', 'Z'])
    expect(output.natural).toStrictEqual(['item2', 'item10'])
  })

  it('supports lexical comparison and pinned array values', () => {
    expect(
      sortValue(['a', 'Z', '_', 'A'], { arrayValues: { sortType: 'lexical' } }),
    ).toStrictEqual(['A', 'Z', '_', 'a'])
    expect(
      sortValue(['.aaa', 'z', '.env?', 'a'], {
        arrayValues: { sortType: 'lexical', priority: ['.env?'] },
      }),
    ).toStrictEqual(['.env?', '.aaa', 'a', 'z'])
  })

  it('sorts nested keys and arrays without mutating the input', () => {
    const nested = Object.freeze({ z: 1, a: 2 })
    const values = Object.freeze(['b', 'a'])
    const input = Object.freeze({ z: nested, a: values })
    const output = sortValue(input)
    expect(Object.keys(output)).toStrictEqual(['a', 'z'])
    expect(Object.keys(output.z)).toStrictEqual(['a', 'z'])
    expect(output.a).toStrictEqual(['a', 'b'])
    expect(output).not.toBe(input)
    expect(output.z).not.toBe(nested)
    expect(output.a).not.toBe(values)
    expect(Object.keys(input)).toStrictEqual(['z', 'a'])
    expect(values).toStrictEqual(['b', 'a'])
  })

  it('preserves own __proto__ keys without changing object prototypes', () => {
    const input = JSON.parse('{"z":1,"__proto__":{"polluted":true},"a":2}') as Record<
      string,
      unknown
    >
    const output = sortValue(input)
    expect(Object.hasOwn(output, '__proto__')).toBe(true)
    expect(output['__proto__']).toStrictEqual({ polluted: true })
    expect(Object.getPrototypeOf(output)).toBe(Object.prototype)
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false)
  })

  it('supports descending natural keys and case-insensitive stable ties', () => {
    expect(
      Object.keys(
        sortValue(
          { a1: 1, a2: 3, a10: 2 },
          {
            objectKeys: { sortType: 'natural', order: 'desc' },
          },
        ),
      ),
    ).toStrictEqual(['a10', 'a2', 'a1'])
    expect(
      sortValue(['B', 'b', 'a'], {
        arrayValues: { caseSensitive: false },
      }),
    ).toStrictEqual(['a', 'B', 'b'])
  })

  it('respects thresholds while continuing recursive sorting', () => {
    const output = sortValue(
      { z: { b: 1, a: 2 }, a: ['b', 'a'] },
      {
        arrayValues: { minValues: 3 },
        objectKeys: { minKeys: 3 },
      },
    )
    expect(Object.keys(output)).toStrictEqual(['z', 'a'])
    expect(Object.keys(output.z)).toStrictEqual(['b', 'a'])
    expect(output.a).toStrictEqual(['b', 'a'])
  })

  it('pins named keys and sorts remaining keys with structured settings', () => {
    const output = sortValue(
      { item2: 2, item10: 10, name: 'x', version: '1' },
      {
        objectKeys: {
          overrides: [
            {
              order: ['name', { key: 'version', sortType: 'natural' }],
              pathPattern: '',
            },
          ],
        },
      },
    )
    expect(Object.keys(output)).toStrictEqual(['name', 'version', 'item2', 'item10'])
  })

  it('applies overrides only at matching paths', () => {
    const output = sortValue(
      { scripts: { a: 1, z: 2 }, other: { z: 1, a: 2 } },
      {
        objectKeys: { overrides: [{ order: 'desc', pathPattern: 'scripts' }] },
      },
    )
    expect(Object.keys(output.scripts)).toStrictEqual(['z', 'a'])
    expect(Object.keys(output.other)).toStrictEqual(['a', 'z'])
  })

  it('clears an earlier named order when a later override supplies a direction', () => {
    const output = sortValue(
      { a: 1, m: 3, z: 2 },
      {
        objectKeys: {
          overrides: [
            { order: ['a'], pathPattern: '**' },
            { order: 'desc', pathPattern: '' },
          ],
        },
      },
    )
    expect(Object.keys(output)).toStrictEqual(['z', 'm', 'a'])
  })

  it('sorts scalar values by value and preserves ties', () => {
    expect(sortValue([10, 2, 1])).toStrictEqual([1, 2, 10])
    expect(
      sortValue(['item10', 'item2'], { arrayValues: { sortType: 'natural' } }),
    ).toStrictEqual(['item2', 'item10'])
    expect(sortValue([true, null, 'a', 2, false])).toStrictEqual([
      null,
      false,
      true,
      2,
      'a',
    ])
  })

  it('sorts objects by configured fields with first-present-key fallback', () => {
    const output = sortValue(
      [{ id: 2, label: 'first' }, { name: 1 }, { id: 2, label: 'second' }],
      { arrayValues: { keys: ['id', 'name'] } },
    )
    expect(output).toStrictEqual([
      { name: 1 },
      { id: 2, label: 'first' },
      { id: 2, label: 'second' },
    ])
    expect(
      sortValue([{ id: 3 }, { id: 1 }], { arrayValues: { key: 'id' } }),
    ).toStrictEqual([{ id: 1 }, { id: 3 }])
  })

  it('canonically compares objects and handles mixed arrays', () => {
    expect(sortValue([{ z: 1 }, { a: 1 }])).toStrictEqual([{ a: 1 }, { z: 1 }])
    expect(sortValue(['z', { a: 1 }, 'a'])).toStrictEqual(['a', 'z', { a: 1 }])
    expect(
      sortValue(['z', { a: 1 }, 'a'], { arrayValues: { order: 'desc' } }),
    ).toStrictEqual([{ a: 1 }, 'z', 'a'])
  })

  it('preserves relative object order when serialization is disabled', () => {
    expect(
      sortValue([{ z: 1 }, 'b', { a: 2 }, 'a'], {
        arrayValues: { serialize: false },
      }),
    ).toStrictEqual(['a', 'b', { z: 1 }, { a: 2 }])
    expect(
      sortValue([{ z: 1 }, { a: 2 }], {
        arrayValues: { serialize: false },
      }),
    ).toStrictEqual([{ z: 1 }, { a: 2 }])
  })
})

it('resolves default named-order ranks without requiring a named order', () => {
  expect(buildNamedOrderRanks(resolveObjectKeyOptions([], {})).rankByKey.size).toBe(0)
})
