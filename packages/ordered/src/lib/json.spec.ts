import { describe, expect, it } from 'vitest'

import { sortJsonString, sortJsonValue } from './json.js'

describe('JSON sorting', () => {
  it('sorts parsed values', () => {
    expect(Object.keys(sortJsonValue({ a: 2, z: 1 }))).toStrictEqual(['a', 'z'])
  })

  it('preserves own __proto__ keys', () => {
    const input = JSON.parse('{"z":1,"__proto__":{"polluted":true},"a":2}')
    expect(JSON.parse(sortJsonString(JSON.stringify(input)))).toStrictEqual(input)
  })

  it('formats JSON with configured indentation', () => {
    expect(sortJsonString('{"b":1,"a":2}')).toBe('{\n  "a": 2,\n  "b": 1\n}')
    expect(sortJsonString('{"b":1,"a":2}', { indent: '\t' })).toBe(
      '{\n\t"a": 2,\n\t"b": 1\n}',
    )
  })

  it.each(['', '{broken', '{"a":1,}'])('rejects malformed JSON %j', input => {
    expect(() => sortJsonString(input)).toThrow(SyntaxError)
  })
})
