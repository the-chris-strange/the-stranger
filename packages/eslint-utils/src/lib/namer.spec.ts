import { describe, expect, it } from 'vitest'

import { namer } from './namer.js'

describe('namer', () => {
  it('returns the base name when called without arguments', () => {
    expect(namer()).toBe('@the-stranger/eslint')
  })

  it('returns the base name when called with the base name as an argument', () => {
    expect(namer('@the-stranger/eslint')).toBe('@the-stranger/eslint')
  })

  it('returns the base name followed by the argument when called with a string argument', () => {
    expect(namer('foo')).toBe('@the-stranger/eslint/foo')
  })
})
