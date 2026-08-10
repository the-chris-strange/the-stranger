import { fileURLToPath, URL } from 'node:url'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { namer } from './namer.js'

describe('namer', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the base name when called without arguments', () => {
    expect(namer()).toBe('@the-stranger/eslint')
  })

  it('returns the base name when called with the base name as an argument', () => {
    expect(namer('@the-stranger/eslint')).toBe('@the-stranger/eslint')
  })

  it('returns the base name followed by the argument when called with a string argument', () => {
    expect(namer('foo')).toBe('@the-stranger/eslint/foo')
  })

  it('derives the base name from the consuming package', async () => {
    vi.resetModules()
    vi.spyOn(process, 'cwd').mockReturnValue(
      fileURLToPath(new URL('../../../..', import.meta.url)),
    )

    const { namer: consumingNamer } = await import('./namer.js')

    expect(consumingNamer()).toBe('@the-stranger/root')
  })
})
