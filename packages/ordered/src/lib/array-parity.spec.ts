import { describe, expect, it } from 'vitest'
import { parse, stringify } from 'yaml'

import type { SortOptions } from './types.js'

import { sortValue } from './core.js'
import { sortYamlString } from './yaml.js'

describe('array comparison across values and YAML nodes', () => {
  it.each([
    {
      name: 'priority values, duplicate entries, and descending lexical order',
      input: ['Z', 'first', 'a', 'first'],
      options: {
        arrayValues: { sortType: 'lexical', order: 'desc', priority: ['first'] },
      },
      expected: ['first', 'first', 'a', 'Z'],
    },
    {
      name: 'natural object fields with fallback keys and stable ties',
      input: [
        { name: 'item10', label: 'last' },
        { id: 'item2', label: 'first' },
        { name: 'item2', label: 'second' },
      ],
      options: { arrayValues: { sortType: 'natural', keys: ['id', 'name'] } },
      expected: [
        { id: 'item2', label: 'first' },
        { label: 'second', name: 'item2' },
        { label: 'last', name: 'item10' },
      ],
    },
    {
      name: 'lexical serialized objects',
      input: [{ a: 1 }, { Z: 1 }],
      options: { arrayValues: { sortType: 'lexical' } },
      expected: [{ Z: 1 }, { a: 1 }],
    },
    {
      name: 'mixed arrays with serialization disabled',
      input: [{ z: 1 }, 'a', { a: 2 }, 'b'],
      options: { arrayValues: { sortType: 'locale', order: 'desc', serialize: false } },
      expected: [{ z: 1 }, { a: 2 }, 'b', 'a'],
    },
  ] satisfies {
    expected: unknown[]
    input: unknown[]
    name: string
    options: SortOptions
  }[])('preserves $name', ({ input, options, expected }) => {
    expect(sortValue(input, options)).toStrictEqual(expected)
    expect(parse(sortYamlString(stringify(input), options))).toStrictEqual(expected)
  })
})
