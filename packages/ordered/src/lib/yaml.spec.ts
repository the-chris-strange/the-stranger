import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

import { sortYamlString, sortYamlValue } from './yaml.js'

describe('YAML sorting', () => {
  it('sorts parsed values', () => {
    expect(Object.keys(sortYamlValue({ a: 2, z: 1 }))).toStrictEqual(['a', 'z'])
  })

  it('sorts nested mappings and sequences while retaining comments and styles', () => {
    const output = sortYamlString(
      '# document\nz: [b, a] # values\na:\n  z: 1 # last\n  a: 2\n',
    )
    expect(parse(output)).toStrictEqual({ a: { a: 2, z: 1 }, z: ['a', 'b'] })
    expect(output.indexOf('a:')).toBeLessThan(output.indexOf('z: [ a, b ]'))
    expect(output).toContain('# document')
    expect(output).toContain('# values')
    expect(output).toContain('# last')
  })

  it('retains quoted scalars and custom tags', () => {
    const output = sortYamlString('z: "quoted"\na: !custom tagged\n')
    expect(output).toContain('z: "quoted"')
    expect(output).toContain('a: !custom tagged')
  })

  it('rejects duplicate YAML keys and malformed syntax', () => {
    expect(() => sortYamlString('a: 1\na: 2\n')).toThrow()
    expect(() => sortYamlString('a: [\n')).toThrow()
  })

  it('preserves values when sorting would move aliases before anchors', () => {
    const input = 'z: &shared\n  value: 1\na: *shared\n'
    const output = sortYamlString(input)
    expect(parse(output)).toStrictEqual(parse(input))
    expect(output.indexOf('&shared')).toBeLessThan(output.indexOf('*shared'))
  })

  it('keeps deeply nested anchor declarations before sibling aliases', () => {
    const input = 'z:\n  child: &shared\n    value: 1\na:\n  child: *shared\n'
    const output = sortYamlString(input)
    expect(parse(output)).toStrictEqual(parse(input))
    expect(output.indexOf('&shared')).toBeLessThan(output.indexOf('*shared'))
  })

  it('keeps sequence anchor declarations before aliases when sorting items', () => {
    const input = '- &shared {id: z}\n- {id: a, ref: *shared}\n'
    const output = sortYamlString(input, { arrayValues: { key: 'id' } })
    expect(parse(output)).toStrictEqual(parse(input))
    expect(output.indexOf('&shared')).toBeLessThan(output.indexOf('*shared'))
  })

  it('preserves alias binding when an anchor name is reused', () => {
    const input =
      'z: &shared {id: first}\ny: *shared\nx: &shared {id: second}\nw: *shared\n'
    const output = sortYamlString(input)
    expect(parse(output)).toStrictEqual(parse(input))
    expect(parse(output)).toStrictEqual({
      w: { id: 'second' },
      x: { id: 'second' },
      y: { id: 'first' },
      z: { id: 'first' },
    })
  })
})

it('compares aliased YAML fields by their resolved values', () => {
  const input = 'anchor: &x 2\nitems:\n - id: *x\n - id: 3\n'
  const output = sortYamlString(input, { arrayValues: { key: 'id' } })
  expect(
    (parse(output) as { items: { id: number }[] }).items.map(item => item.id),
  ).toStrictEqual([2, 3])
})

it('sorts YAML containing cyclic anchor references without changing the graph', () => {
  const output = sortYamlString('- &x {self: *x}\n- {a: 0}\n')
  const values = parse(output) as { a?: number; self?: unknown }[]
  const cyclic = values.find(value => Object.hasOwn(value, 'self'))
  expect(cyclic?.self).toBe(cyclic)
  expect(values.some(value => value.a === 0)).toBe(true)
})

it('retains repeated empty YAML sequence items with anchor constraints', () => {
  const input = '- &x value\n- *x\n-\n-\n'
  const output = sortYamlString(input)
  expect(parse(output)).toHaveLength(4)
  expect((parse(output) as unknown[]).filter(value => value === null)).toHaveLength(2)
})

it('sorts sibling aliases while keeping their declaration first', () => {
  const output = sortYamlString('z: &x 1\nc: *x\nb: *x\n')
  expect(Object.keys(parse(output) as object)).toStrictEqual(['z', 'b', 'c'])
})
